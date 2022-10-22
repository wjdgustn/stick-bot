const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

const Stick = require('../../schemas/stick');

module.exports = async interaction => {
    const { options } = interaction;

    const checkBeforeStick = await Stick.findOne({
        channel: interaction.channel.id
    });

    const embed = checkBeforeStick && checkBeforeStick.embed ? checkBeforeStick.embed : {
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
        },
        {
            label: '썸네일 / Thumbnail',
            description: '임베드에 넣을 썸네일입니다. / Embed\'s thumbnail.',
            value: 'thumbnail'
        },
        {
            label: '푸터 / Footer',
            description: '임베드에 넣을 푸터입니다. / Embed\'s footer.',
            value: 'footer'
        }
    ];

    if(typeof embed.color === 'string')
        embed.color = parseInt(`0x${embed.color.replace('#', '')}`, 16);

    const msg = await interaction.reply({
        fetchReply: true,
        content: '아래는 임베드 미리보기입니다. 셀렉터에서 수정할 항목을 선택하여 임베드를 수정하고, 적용하려면 완료를 눌러주세요.\nBelow is an embedded preview. Select the item to modify in the selector to modify the embed, and press Done to apply it.',
        embeds: [embed],
        components: [
            new ActionRowBuilder()
                .addComponents(
                    new SelectMenuBuilder()
                        .setCustomId('select')
                        .setPlaceholder('수정할 항목을 선택하세요. / Please select the item you want to modify.')
                        .addOptions(embedOptions)
                ),
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('apply')
                        .setLabel('완료 / Done')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('cancel')
                        .setLabel('취소 / Cancel')
                        .setStyle(ButtonStyle.Danger)
                )
        ]
    });

    let doingEdit = false;
    let applied = false;
    const collector = msg.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        time: 1000 * 60 * 20
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

        let response;
        try {
            response = await i.awaitModalSubmit(
                new ModalBuilder()
                    .setTitle('값 변경 / Value Change')
                    .addComponents([
                        new ActionRowBuilder()
                            .addComponents([
                                new TextInputBuilder()
                                    .setCustomId('input')
                                    .setLabel(`${fieldLabel[0].trim()} / ${(fieldLabel[1] || fieldLabel[0]).trim()}`)
                                    .setPlaceholder('변경할 값을 입력하세요. / Input the value you want to change.')
                                    .setStyle(fieldName === 'description' ? TextInputStyle.Paragraph : TextInputStyle.Short)
                                    .setValue(embed[fieldName]?.text || embed[fieldName]?.url || embed[fieldName]?.toString() || '')
                            ])
                    ])
            , 1000 * 60 * 15);
        } catch(e) {
            console.log(e);
            return interaction.followUp({
                content: '시간이 초과되었습니다.\nTime out.',
                ephemeral: true
            });
        }

        doingEdit = false;
        const responseValue = response.fields.getTextInputValue('input');

        const valueBackup = embed[fieldName];

        if([
            'image',
            'thumbnail'
        ].includes(fieldName)) embed[fieldName] = {
            url: responseValue
        };
        else if(fieldName === 'footer') embed[fieldName] = {
            text: responseValue
        };
        else if(fieldName === 'color') embed[fieldName] = parseInt(`0x${responseValue.replace('#', '')}`, 16);
        else embed[fieldName] = responseValue;

        try {
            await response.update({
                embeds: [embed]
            });
        } catch(e) {
            if(!valueBackup) delete embed[fieldName];
            else embed[fieldName] = valueBackup;

            await interaction.editReply({
                embeds: [embed]
            });
            await interaction.followUp({
                content: '입력값이 잘못되었습니다!\nWrong input!',
                ephemeral: true
            });
        }
    });

    collector.on('end', async () => {
        // msg.components[0].components[0].setDisabled();
        // msg.components[1].components[0].setDisabled();
        // msg.components[1].components[1].setDisabled();
        //
        // await interaction.editReply({
        //     components: msg.components
        // });

        await interaction.deleteReply();

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
                content: '이 채널의 고정 임베드를 설정하였습니다.\nEmbed Stick message has been set.',
                ephemeral: true
            });
        }
    });
}