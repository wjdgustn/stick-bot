const setting = require('../setting.json');

module.exports = {
    info: {
        name: 'invite',
        description: '봇을 초대하는 링크를 표시합니다. // Show bot invite link.'
    },
    handler: async interaction => {
        return interaction.reply(
            lang.langByLangName(interaction.dbUser.lang, 'BOT_INVITE')
                .replace('{minperm}', `https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=${setting.BOT_PERMISSION}&scope=bot%20applications.commands`)
                .replace('{admin}', `https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`)
        );
    }
}
