const Stick = require('../../schemas/stick');

module.exports = async interaction => {
    const { options } = interaction;

    const color = options.getString('color');

    if(color != null && !/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(color)) return interaction.reply({
        content: '색 코드가 유효하지 않습니다. #aaaaaa 형태여야 합니다.',
        ephemeral: true
    });

   await Stick.deleteMany({
       channel: interaction.channel.id
   });

   const cooldown = options.getNumber('cooldown');

   await Stick.create({
       channel: interaction.channel.id,
       title: options.getString('title').split('///').join('\n'),
       description: options.getString('description')?.split('///').join('\n'),
       color: color || '#349eeb',
       image: options.getString('image'),
       type: 'embed',
       cooldown: cooldown !== null ? cooldown * 1000 : 0
   });

    return interaction.reply({
        content: '이 채널의 고정 임베드를 설정하였습니다.',
        ephemeral: true
    });
}