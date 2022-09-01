const Stick = require('../schemas/stick');

const running = {};
const cooldown = {};

module.exports = async message => {
    const stick = await Stick.findOne({
        channel: message.channel.id
    });

    if(!stick) return;

    if(running[message.channel.id]) return;
    running[message.channel.id] = true;

    if(cooldown[message.channel.id] != null) clearTimeout(cooldown[message.channel.id]);

    cooldown[message.channel.id] = setTimeout(async () => {
        if(stick.lastMessage != null) {
            try {
                const lastMessage = await message.channel.messages.fetch(stick.lastMessage);
                await lastMessage.delete();
            } catch (e) {}
        }

        let msg;
        switch(stick.type) {
            case 'message':
                msg = stick.message;
                break;
            case 'embed':
                if(stick.newEmbed) {
                    if(typeof stick.embed.color === 'string')
                        stick.embed.color = parseInt(`0x${stick.embed.color.replace('#', '')}`, 16);
                    msg = {
                        embeds: [stick.embed]
                    }
                }
                else msg = {
                    embeds: [
                        {
                            title: stick.title,
                            description: stick.description,
                            color: stick.color,
                            image: stick.image ? {
                                url: stick.image
                            } : null
                        }
                    ]
                }
                break;
            default:
                return;
        }

        try {
            const sentMessage = await message.channel.send(msg);

            await Stick.updateOne({
                channel: message.channel.id
            }, {
                lastMessage: sentMessage.id
            });
        } catch (e) {}

        if(stick.cooldown === 0) delete running[message.channel.id];
    }, stick.cooldown);

    if(stick.cooldown !== 0) delete running[message.channel.id];
}