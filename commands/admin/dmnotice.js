// const main = require('../../main');

module.exports = async interaction => {
    await interaction.reply('DM 전송 작업을 시작합니다.');

    const content = interaction.options.getString('content');

    const sent = [];
    const success = [];
    const fail = [];
    const dup = [];

    const guilds = await interaction.client.guilds.fetch();
    for(let g of guilds.values()) {
        const guild = await g.fetch();
        const owner = await guild.fetchOwner();

        if(sent.includes(owner.id)) {
            dup.push({
                guild,
                owner
            });
            continue;
        }

        try {
            await owner.send(content);
            sent.push(owner.id);
            success.push({
                guild,
                owner
            });
        } catch (e) {
            fail.push({
                guild,
                owner
            });
        }
    }

    return interaction.editReply(`공지 전송 결과입니다.\n✅ 성공 \`\`\`diff\n${success.length ? success.map(a => `+ ${a.guild.name}(${a.owner.user.tag})`) : '없음'}\`\`\`\n❌ 실패 \`\`\`diff\n${fail.length ? fail.map(a => `- ${a.guild.name}(${a.owner.user.tag})`) : '없음'}\`\`\`\n⚠️ 중복 제외 \`\`\`\n${dup.length ? dup.map(a => `- ${a.guild.name}(${a.owner.user.tag})`) : '없음'}\`\`\``);
}