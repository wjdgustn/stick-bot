module.exports = {
    info: {
        name: 'patch',
        description: `패치노트를 확인합니다. / Check Bot's patch note`,
    },
    handler: async interaction => {
        return interaction.reply({
            content: `메시지 관리권한만 / Only manage message : https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8192&scope=bot%20applications.commands\n모든 권한 (어드민) / Full Permission (ADMIN) : https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`,
            ephemeral: true
        });
    }
};
