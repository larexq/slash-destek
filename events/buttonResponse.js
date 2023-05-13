const { EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'interactionCreate',
    once: false,

    async execute(interaction, client) {
        if (!interaction.isButton()) return;

        const button = interaction.customId;
        const user = interaction.user;
        const guild = interaction.guild;

        const date = JSON.parse(fs.readFileSync(`./database/${guild.id}.json`));
        const staffRole = date.role;
        const openCategory = date.open;
        const closeCategory = date.close;

        const errorEmbed = new EmbedBuilder()
            .setTitle('⚠️ Hata')
            .setColor('#FF0000')
            .setTimestamp();

        if (!guild.roles.cache.get(staffRole)) {
            errorEmbed.setDescription('Yetkili rolü silindi.\nBotu yeniden kurmak için lütfen `/kurulum` komutunu kullanın.');
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!guild.channels.cache.get(openCategory)) {
            errorEmbed.setDescription('Açık destek kategorisi silinmiştir.\nBotu yeniden yapılandırmak için lütfen `/kurulum` komutunu kullanın.');

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (!guild.channels.cache.get(closeCategory)) {
            errorEmbed.setDescription('Kapatma destek kategorisi silinmiştir.\nBotu yeniden yapılandırmak için lütfen `/kurulum` komutunu kullanın.');

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (button == 'create_ticket') {
            const channel = await guild.channels.create({
                name: `ticket-${user.username}`,
                type: ChannelType.GuildText,
                parent: openCategory,
                topic: `${user.username} ${user.id}`,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: PermissionFlagsBits.ViewChannel
                    },
                    {
                        id: user.id,
                        allow: PermissionFlagsBits.ViewChannel
                    },
                    {
                        id: staffRole,
                        allow: PermissionFlagsBits.ViewChannel
                    }
                ]
            });
            
            const ticketEmbed = new EmbedBuilder()
                .setTitle('🎫 Destek Sistemi')
                .setDescription(`Merhaba <@${user.id}>, destek talebi açma nedeninizi yazınız.\nEn kısa <@&${staffRole}> geri dönüş yapacaktır beklemede kalınız..`)
                .setColor('#6104b9')
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTimestamp();
            
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('📩 Destek Talebini Kapat')
                        .setStyle(ButtonStyle.Danger)
                );

            await channel.send({ embeds: [ticketEmbed], components: [row] });
            await interaction.reply({ content: `✅ Destek talebiniz şu tarihte oluşturuldu ${channel}`, ephemeral: true });
        } else if (button == 'close_ticket') {
            const ticketEmbed = new EmbedBuilder()
                .setTitle('🎫 Destek Sistemi')
                .setDescription(`Merhaba <@${user.id}>, destek talebini kapatmak istediğinizden emin misiniz?`)
                .setColor('#e00000')
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirm_close_ticket')
                        .setLabel('✅  Evet )
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('cancel_close_ticket')
                        .setLabel('❌ Hayır')
                        .setStyle(ButtonStyle.Danger)
                );
                
            await interaction.update({ embeds: [ticketEmbed], components: [row] });
        } else if (button == 'confirm_close_ticket') {
            const channel = interaction.channel;
            const username = channel.topic.split(' ')[0];

            const ticketEmbed = new EmbedBuilder()
                .setTitle('🎫 Destek Sistemi ')
                .setDescription(`Destek talebi <@${user.id}> tarafından kapatıldı.`)
                .setColor('#e00000')
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('delete_ticket')
                        .setLabel('🗑️ Sil')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('reopen_ticket')
                        .setLabel('🔓 Tekrar Aç')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('transcript_ticket')
                        .setLabel('📄 Transcript')
                        .setStyle(ButtonStyle.Primary)
                );

            await interaction.update({ embeds: [ticketEmbed], components: [row] });

            await channel.setParent(closeCategory);
            await channel.setName(`closed-${username}`);
            await channel.setParent(closeCategory);
            await channel.permissionOverwrites.edit(guild.id, {
                SendMessages: false,
                ViewChannel: false
            });
        } else if (button == 'cancel_close_ticket') {
            const channel = interaction.channel;
            const userid = channel.topic.split(' ')[1];

            const ticketEmbed = new EmbedBuilder()
                .setTitle('🎫 Destek Sistemi ')
                .setDescription(`Merhaba <@${user.id}>, destek talebi açma nedeninizi yazınız.\nEn kısa <@&${staffRole}> geri dönüş yapacaktır beklemede kalınız..`)
                .setColor('#6104b9')
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('📩 Destek Talebini Kapat')
                        .setStyle(ButtonStyle.Danger)
                );

            await interaction.update({ embeds: [ticketEmbed], components: [row] });
        } else if (button == 'delete_ticket') {
            const channel = interaction.channel;

            const ticketEmbed = new EmbedBuilder()
                .setTitle('🎫 Destek Sistemi ')
                .setDescription(`Destek talebiniz 5 saniye içinde silinecektir.`)
                .setColor('#e00000')
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTimestamp();

            await interaction.update({ embeds: [ticketEmbed], components: [] });
            setTimeout(() => {
                channel.delete();
            }, 5000);
        } else if (button == 'reopen_ticket') {
            const channel = interaction.channel;
            const username = channel.topic.split(' ')[0];
            const userid = channel.topic.split(' ')[1];

            const ticketEmbed = new EmbedBuilder()
                .setTitle('🎫 Destek Sistemi ')
                .setDescription(`Merhaba <@${userid}>, destek talebiniz yeniden açıldı.\nLütfen <@&${staffRole}> yanıtını bekleyin.`)
                .setColor('#6104b9')
                .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('📩 Destek Talebini Kapat')
                        .setStyle(ButtonStyle.Danger)
                );

            await channel.setParent(openCategory);
            await channel.setName(`ticket-${username}`);
            await channel.permissionOverwrites.edit(userid, {
                SendMessages: true,
                ViewChannel: true
            });
            await interaction.update({ embeds: [ticketEmbed], components: [row] });
        } else if (button == 'transcript_ticket') {
            const channel = interaction.channel;
            const messages = await channel.messages.fetch();
            const contentHandler = `Transcript for ${channel.name} (${channel.id})\n\n`;
            const content = messages.map(m => `[${m.createdAt.toLocaleDateString()} ${m.createdAt.toLocaleTimeString()}] ${m.author.tag}: ${m.content}`).join('\n');

            const transcript = new AttachmentBuilder()
                .setName(`transcript-${channel.name}.txt`)
                .setFile(Buffer.from(contentHandler + content));
            
            await interaction.reply({ content: `📩 Your transcript is ready.`, files: [transcript] });
        }
    }
}