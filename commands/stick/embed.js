const { MessageActionRow , MessageButton , MessageSelectMenu } = require('discord.js');

const utils = require('../../utils');

const Stick = require('../../schemas/stick');

module.exports = async interaction => {
    const { options } = interaction;

    const embed = {
        title: '제목 / Title'
    }

    const embedOptions = [
        {
            label: '제목 / Title',
            description: '임베드의 제목입니다. / Embed\'s title.',
            value: 'title'
        },
        {
            label: '설명 / Description',
            description: '임베드의 설명입니다. / Embed\'s description.',
            value: 'description'
        },
        {
            label: '색 / Color',
            description: '임베드의 색상입니다. / Embed\'s color.',
            value: 'color'
        },
        {
            label: 'URL',
            description: '임베드의 제목 URL입니다. / Embed\'s URL for title.',
            value: 'url'
        },
        {
            label: '이미지 / Image',
            description: '임베드에 넣을 이미지입니다. / Embed\'s image.',
            value: 'image'
        }
    ];

    const msg = await interaction.reply({
        fetchReply: true,
        content: '아래는 임베드 미리보기입니다. 셀렉터에서 수정할 항목을 선택하여 임베드를 수정하고, 적용하려면 완료를 눌러주세요.\nBelow is an embedded preview. Select the item to modify in the selector to modify the embed, and press Done to apply it.',
        embeds: [embed],
        components: [
            new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('select')
                        .setPlaceholder('수정할 항목을 선택하세요. / Please select the item you want to modify.')
                        .addOptions(embedOptions)
                ),
            new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('apply')
                        .setLabel('완료 / Done')
                        .setStyle('SUCCESS'),
                    new MessageButton()
                        .setCustomId('cancel')
                        .setLabel('취소 / Cancel')
                        .setStyle('DANGER')
                )
        ]
    });

    let doingEdit = false;
    let applied = false;
    const collector = msg.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        time: 180000
    });

    collector.on('collect', async i => {
        if(i.customId === 'cancel') {
            await i.deferUpdate();
            return collector.stop();
        }

        if(doingEdit) return i.deferUpdate();

        if(i.customId === 'apply') {
            applied = true;
            collector.stop();
            return i.deferUpdate();
        }

        doingEdit = true;
        collector.resetTimer();
        const fieldName = i.values[0];

        const fieldLabel = embedOptions.find(a => a.value === fieldName).label.split('/');
        const msg = await i.reply({
            fetchReply: true,
            content: `${fieldLabel[0].trim()}${utils.checkBatchim(fieldLabel[0].trim()) ? '을' : '를'} 입력해주세요.\nInput ${(fieldLabel[1] || fieldLabel[0]).trim()}.`,
        });

        let response = await interaction.channel.awaitMessages({
            filter: m => m.author.id === interaction.user.id && m.content,
            time: 120000,
            max: 1
        });
        doingEdit = false;
        if(!response.first()) return interaction.followUp('시간이 초과되었습니다.\nTime out.');
        const responseMsg = response.first();
        response = response.first().content;

        const valueBackup = embed[fieldName];

        if(fieldName === 'image') embed[fieldName] = {
            url: response
        };
        else embed[fieldName] = response;

        try {
            await interaction.editReply({
                embeds: [embed]
            });
        } catch(e) {
            embed[fieldName] = valueBackup;

            await interaction.followUp({
                content: '입력값이 잘못되었습니다!\nWrong input!',
                ephemeral: true
            });
            await interaction.editReply({
                embeds: [embed]
            });
        }

        await msg.delete();
        try {
            await responseMsg.delete();
        } catch(e) {}
    });

    collector.on('end', async () => {
        // msg.components[0].components[0].setDisabled();
        // msg.components[1].components[0].setDisabled();
        // msg.components[1].components[1].setDisabled();
        //
        // await interaction.editReply({
        //     components: msg.components
        // });

        await msg.delete();

        if(!applied) return interaction.followUp({
            content: '고정 메시지 설정이 취소되었습니다.\nStick message setting cancelled.',
            ephemeral: true
        });
        else {
            await Stick.deleteMany({
                channel: interaction.channel.id
            });

            const cooldown = options.getNumber('cooldown');

            await Stick.create({
                channel: interaction.channel.id,
                type: 'embed',
                cooldown: cooldown !== null ? cooldown * 1000 : 0,
                newEmbed: true,
                embed
            });

            return interaction.followUp({
                content: '이 채널의 고정 임베드를 설정하였습니다.\Embed Stick message has been set.',
                ephemeral: true
            });
        }
    });
}
