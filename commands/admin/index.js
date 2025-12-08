const { ApplicationCommandOptionType: Options } = require('discord.js');
const fs = require('fs');

const main = require('../../bot');

module.exports = {
    private: true,
    info: {
        name: 'admin',
        description: '봇 관리자 전용 명령어입니다.',
        options: [
            {
                name: 'clearcommand',
                description: '디스코드 애플리케이션에 등록된 슬래시 커맨드를 모두 삭제합니다. 봇 재시작이 필요합니다.',
                type: Options.Subcommand
            },
            {
                name: 'reload',
                description: '봇의 기능들을 리로드합니다.',
                type: Options.SubcommandGroup,
                options: [
                    {
                        name: 'owners',
                        description: '디스코드 애플리케이션 소유자 정보를 다시 가져옵니다.',
                        type: Options.Subcommand
                    },
                    {
                        name: 'dokdo',
                        description: 'dokdo를 재설정합니다.',
                        type: Options.Subcommand
                    },
                    {
                        name: 'commands',
                        description: '슬래시 커맨드를 다시 등록합니다.',
                        type: Options.Subcommand
                    }
                ]
            },
            {
                name: 'dmnotice',
                description: '모든 서버 소유자 DM으로 공지를 전송합니다.',
                type: Options.Subcommand,
                options: [
                    {
                        name: 'content',
                        description: '전송할 내용입니다.',
                        type: Options.String,
                        required: true
                    }
                ]
            }
        ]
    },
    handler: async interaction => {
        if(!main.getOwnerID().includes(interaction.user.id)) return;

        let command = interaction.options.getSubcommand();
        if(!fs.existsSync(`./commands/admin/${command}.js`)) command = interaction.options.getSubcommandGroup();

        if(fs.existsSync(`./commands/admin/${command}.js`)) require(`./${command}.js`)(interaction);
        else interaction.reply({
            content: '오류가 발생하였습니다.',
            ephemeral: true
        });
    }
}