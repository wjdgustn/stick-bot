const Stick = require('../../schemas/stick');

module.exports = async interaction => {
    const { options } = interaction;

   await Stick.deleteOne({
       channel: interaction.channel.id
   });

    const cooldown = options.getNumber('cooldown');

   await Stick.create({
       channel: interaction.channel.id,
       message: options.getString('message').split('///').join('\n'),
       type: 'message',
       cooldown: cooldown !== null ? cooldown * 1000 : 0
   });

    return interaction.reply({
        content: '이 채널의 고정 메시지를 설정하였습니다.\n Stick message has been set. ',
        ephemeral: true
    });
}
