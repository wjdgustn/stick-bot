module.exports = {
    info: {
        name: 'support',
        description: `지원 서버 링크를 확인합니다. / Check bot's Support server Link.`,
    },
    handler: async interaction => {
        return interaction.reply({
            content: `지원 서버 링크 / Support Server invite link : https://discord.gg/zESCFncp28`,
            ephemeral: true
        });
    }
};
