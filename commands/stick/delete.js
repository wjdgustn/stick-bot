const Stick = require('../../schemas/stick');

module.exports = async interaction => {
   await Stick.deleteOne({
       channel: interaction.channel.id
   });

    return interaction.reply({
        content: '이 채널의 고정 메시지를 중단했습니다.',
        ephemeral: true
    });
}