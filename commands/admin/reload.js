const main = require('../../main');
const utils = require('../../utils');

module.exports = async interaction => {
    await interaction.deferReply({
        ephemeral: true
    });

    const target = interaction.options.getSubcommand();

    switch(target) {
        case 'commands':
            await main.registerCommands();
            break;
        case 'dokdo':
            await main.loadDokdo();
            break;
        case 'owners':
            await main.loadOwners();
            break;
        default:
            return interaction.editReply('알 수 없는 리로드 대상입니다.');
    }

    await interaction.editReply(`${target}${utils.checkBatchim(target) ? '을' : '를'} 리로드하였습니다.`);
}