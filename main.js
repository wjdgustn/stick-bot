const {
    Client,
    Team,
    GatewayIntentBits
} = require('discord.js');
const fs = require('fs');
const {
    Jejudo,
    SummaryCommand,
    EvaluateCommand,
    ShellCommand,
    DocsCommand
} = require('jejudo');
const awaitModalSubmit = require('await-modal-submit');

const setting = require('./setting.json');
const utils = require('./utils');
const Stick = require('./schemas/stick');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});
let JejudoHandler;

const StickMessageHandler = require('./handler/StickMessageHandler');

let application;
let owners = [];
let ownerID = [];
let teamOwner;
module.exports.getClient = () => client;
module.exports.getOwners = () => owners;
module.exports.getOwnerID = () => ownerID;
module.exports.getTeamOwner = () => teamOwner;

const ServerCache = {
    role: {},
    channel: {},
    emoji: {}
}
module.exports.Server = ServerCache;

awaitModalSubmit(client);

const connect = require('./schemas');
connect();

let commandHandler = {};
let commands = [];
let privateCommands = [];
let allCommands = [];

const debug = process.argv[2] === '--debug';
if(debug && !process.argv[3]) {
    console.error('Debug guild missing');
    process.exit(1);
}

const loadOwners = async () => {
    application = await client.application.fetch();
    owners = application.owner instanceof Team ? application.owner.members.map(a => a.user) : [application.owner];
    ownerID = owners.map(a => a.id);
    teamOwner = application.owner instanceof Team ? application.owner.ownerId : application.owner.id;

    ownerID.push(...setting.OWNERS);
}

const loadJejudo = () => {
    JejudoHandler = new Jejudo(client, {
        command: 'j',
        textCommand: [
            'jeju',
            'jejudo',
            'dok',
            'dokdo'
        ],
        prefix: setting.JEJUDO_PREFIX,
        owners: ownerID,
        registerDefaultCommands: false,
        secrets: [
            setting.MONGODB_HOST,
            setting.MONGODB_PORT,
            setting.MONGODB_USER,
            setting.MONGODB_PASSWORD
        ],
        globalVariable: {
            Stick,
            setting,
            utils,
            main: module.exports
        }
    });

    const editedEvaluateCommand = new EvaluateCommand(JejudoHandler);
    editedEvaluateCommand.data.name = 'js';

    const editedShellCommand = new ShellCommand(JejudoHandler);
    editedShellCommand.data.name = 'sh';

    JejudoHandler.registerCommand(new SummaryCommand(JejudoHandler));
    JejudoHandler.registerCommand(editedEvaluateCommand);
    JejudoHandler.registerCommand(editedShellCommand);
    JejudoHandler.registerCommand(new DocsCommand(JejudoHandler));
}

const loadCommands = () => {
    commandHandler = {};
    commands = [];
    privateCommands = [];
    allCommands = [];
    fs.readdirSync('./commands').forEach(c => {
        const file = require.resolve(`./commands/${c}`);
        delete require.cache[file];
        const module = require(`./commands/${c}`);
        commandHandler[module.info.name] = module.handler;
        if(module.private) privateCommands.push(module.info);
        else commands.push(module.info);

        allCommands.push(module.info);
    });
}

const registerCommands = async () => {
    if(debug) {
        console.log('registering debug guild command...');
        await client.guilds.cache.get(process.argv[3]).commands.set(allCommands);
        console.log('registered debug guild command. registering debug guild command permission...');
        console.log('registered debug guild command permission.');
    }
    else {
        console.log('registering global command...');
        await client.application.commands.set(commands);
        console.log('registered global command.');
    }
}

module.exports.loadOwners = loadOwners;
module.exports.loadDokdo = loadJejudo;
module.exports.loadCommands = loadCommands;
module.exports.registerCommands = registerCommands;

client.once('ready', async () => {
    console.log(`${client.user.tag}으로 로그인하였습니다.`);

    await loadOwners();
    loadJejudo();
    loadCommands();
    registerCommands();

    let activityIndex = 0;
    setInterval(async () => {
        await client.user.setActivity(setting.ACTIVITIES[activityIndex]
            .replace('{servercount}', client.guilds.cache.size.toString())
        );
        activityIndex++;
        if(activityIndex >= setting.ACTIVITIES.length) activityIndex = 0;
    }, setting.ACTIVITY_CHANGE_INTERVAL);
});

client.on('interactionCreate', async interaction => {
    if(JejudoHandler) JejudoHandler.handleInteraction(interaction);

    if(interaction.isCommand()) {
        if(!interaction.commandName) return;

        if(!interaction.guild) return interaction.reply('server only');

        if(commandHandler[interaction.commandName] != null) commandHandler[interaction.commandName](interaction);
    }
});

client.on('messageCreate', message => {
    if(message.author.id === client.user.id) return;

    StickMessageHandler(message);

    if(JejudoHandler) JejudoHandler.handleMessage(message);
});

client.on('channelDelete', async channel => {
    await Stick.deleteMany({
        channel: channel.id
    });
});

client.login(setting.TOKEN);