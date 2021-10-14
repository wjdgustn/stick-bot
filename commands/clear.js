const permissions = require("../permissions");

module.exports = {
    info: {
        name: 'clear',
        description: '정해진 갯수만큼 메시지를 청소합니다.',
        options: [
            {
                name: 'count',
                description: '청소할 메시지의 갯수입니다.',
                type: 'NUMBER',
                required: true
            }
        ]
    },
    handler: async interaction => {
        if(!interaction.channel.permissionsFor(interaction.member).has('MANAGE_MESSAGES')) return interaction.reply({
            content: '이 채널에서 "메시지 관리" 권한을 가지고 있어야 합니다.',
            ephemeral: true
        });

        const count = interaction.options.getNumber('count');

        if(count < 1) return interaction.reply({
            content: '청소할 메시지의 수는 1보다 커야 합니다.',
            ephemeral: true
        });

        if(count > 100) return interaction.reply({
            content: '청소할 메시지의 수는 100개 이하여야 합니다.',
            ephemeral: true
        });

        await interaction.channel.bulkDelete(count);

        return interaction.reply({
            content: `메시지 ${count}개를 청소하였습니다.`,
            ephemeral: true
        });
    }
}