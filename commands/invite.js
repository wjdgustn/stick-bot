module.exports = {
    info: {
        name: 'invite',
        description: `봇 초대 링크를 확인합니다. / Check bot's invite Link.`,
    },
    handler: async interaction => {
        return interaction.reply({
            content: `메시지 관리권한만 / Only manage message : https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8192&scope=bot%20applications.commands\n모든 권한 (어드민) / Full Permission (ADMIN) : https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`,
            ephemeral: true
        });
    }
};
