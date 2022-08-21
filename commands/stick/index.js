const { ApplicationCommandOptionType: Options } = require('discord.js');
const fs = require('fs');

module.exports = {
    info: {
        name: 'stick',
        description: '접착 메시지 관련 명령어들입니다. / Stick commands',
        options: [
            {
                name: 'message',
                description: '메시지를 이 채널의 접착 메시지로 설정합니다. / Sets the message to the stick message of this channel.',
                type: Options.Subcommand,
                options: [
                    {
                        name: 'message',
                        description: '접착 메시지로 설정할 메시지, ///로 줄바꿈 가능합니다. / message for to stick. use /// to change the line.',
                        type: Options.String,
                        required: true
                    },
                    {
                        name: 'cooldown',
                        description: '몇초간 메시지가 오지 않았을 때 메시지를 다시 작성할지 설정합니다. / Set cooldown',
                        type: Options.Number
                    }
                ]
            },
            {
                name: 'embed',
                description: '임베드를 이 채널의 접착 메시지로 설정합니다. / Set embed message to the stick massage of this channel',
                type: Options.Subcommand,
                options: [
                    {
                        name: 'cooldown',
                        description: '몇초간 메시지가 오지 않았을 때 메시지를 다시 작성할지 설정합니다. / set cooldown',
                        type: Options.Number
                    }
                ]
            },
            {
                name: 'delete',
                description: '이 채널의 접착 메시지를 삭제합니다. / remove stick message',
                type: Options.Subcommand
            }
        ]
    },
    handler: async interaction => {
        if(!interaction.channel.permissionsFor(interaction.member).has('MANAGE_MESSAGES')) return interaction.reply({
            content: '이 채널에서 "메시지 관리" 권한을 가지고 있어야 합니다. / this command requires "manage message" perm',
            ephemeral: true
        });

        const command = interaction.options.getSubcommand();

        if(fs.existsSync(`./commands/stick/${command}.js`)) require(`./${command}.js`)(interaction);
        else interaction.reply({
            content: '오류가 발생하였습니다. / An error occured',
            ephemeral: true
        });
    }
}
