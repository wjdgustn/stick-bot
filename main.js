const { Client , Intents , Team } = require('discord.js');
const fs = require('fs');
const Dokdo = require('dokdo');

const setting = require('./setting.json');
const utils = require('./utils');
const Stick = require('./schemas/stick');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.DIRECT_MESSAGES
    ],
    partials: [
        'GUILD_MEMBER',
        'CHANNEL'
    ]
});
let DokdoHandler;

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

const connect = require('./schemas');
connect();

let commandHandler = {};
let commands = [];
let privateCommands = [];
let allCommands = [];
let permissions = {};

const debug = process.argv[2] === '--debug';
// if(debug && !process.argv[3]) {
//     console.error('Debug guild missing');
//     process.exit(1);
// }

const loadOwners = async () => {
    application = await client.application.fetch();
    owners = application.owner instanceof Team ? application.owner.members.map(a => a.user) : [application.owner];
    ownerID = owners.map(a => a.id);
    teamOwner = application.owner instanceof Team ? application.owner.ownerId : application.owner.id;
}

const loadDokdo = () => {
    DokdoHandler = new Dokdo(client, {
        aliases: [ 'dokdo', 'dok' ],
        prefix: ';',
        owners: teamOwner,
        secrets: [
            setting.MONGODB_HOST,
            setting.MONGODB_PORT,
            setting.MONGODB_HOST,
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
}

const loadCommands = () => {
    commandHandler = {};
    commands = [];
    privateCommands = [];
    allCommands = [];
    permissions = {};
    fs.readdirSync('./commands').forEach(c => {
        const file = require.resolve(`./commands/${c}`);
        delete require.cache[file];
        const module = require(`./commands/${c}`);
        commandHandler[module.info.name] = module.handler;
        if(module.private) {
            privateCommands.push(module.info);
            permissions[module.info.name] = module.permissions;
        }
        else commands.push(module.info);

        allCommands.push(module.info);
    });
}

const registerCommands = async () => {
    if(debug) {
        console.log('registering debug guild command...');
        const guildCommandInfo = await client.guilds.cache.get(process.argv[3]).commands.set(allCommands);
        console.log('registered debug guild command. registering debug guild command permission...');
        for(let c of guildCommandInfo) {
            if(permissions[c[1].name] != null) await c[1].permissions.set({
                permissions: permissions[c[1].name]
            });
        }
        console.log('registered debug guild command permission.');
    }
    else {
        console.log('registering global command...');
        await client.application.commands.set(commands);
        console.log('registered global command.');

        // const guildCommandInfo = await client.guilds.cache.get(process.argv[3]).commands.set(privateCommands);
        // console.log('registered guild command. registering guild command permission...');
        // for (let c of guildCommandInfo) {
        //     if (permissions[c[1].name] != null) await c[1].permissions.set({
        //         permissions: permissions[c[1].name]
        //     });
        // }
        // console.log('registered guild command permission.');
    }
}

module.exports.loadOwners = loadOwners;
module.exports.loadDokdo = loadDokdo;
module.exports.loadCommands = loadCommands;
module.exports.registerCommands = registerCommands;

client.once('ready', async () => {
    console.log(`${client.user.tag}으로 로그인하였습니다.`);

    await loadOwners();
    loadDokdo();
    loadCommands();
    registerCommands();
});

client.on('interactionCreate', async interaction => {
    if(interaction.isCommand() || interaction.isContextMenu()) {
        if(!interaction.commandName) return;

        if(!interaction.guild) return interaction.reply('server only');

        if(commandHandler[interaction.commandName] != null) commandHandler[interaction.commandName](interaction);
    }
});

client.on('messageCreate', message => {
    if(message.author.bot) return;

    StickMessageHandler(message);

    DokdoHandler.run(message);
});

client.on('channelDelete', async channel => {
    await Stick.deleteMany({
        channel: channel.id
    });
});

client.login(setting.TOKEN);