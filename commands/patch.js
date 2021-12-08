module.exports = {
    info: {
        name: 'patch',
        description: `패치노트를 확인합니다. / check bot's patch note`,
    },
    handler: async interaction => {
        return interaction.reply({
            content: `https://docs.google.com/document/d/1eF7eRCoFbkDGTpRbx-ZvsAWTatkRsIfXJVKmqRCi_eI/edit?usp=sharing`,
            ephemeral: true
        });
    }
}
