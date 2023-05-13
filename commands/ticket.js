const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kurulum')
        .setDescription'Destek sistemini kurun')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option => option.setName('channel').setDescription('Destek sisteminin oluşturulacağı kanal').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('Destek talebine bakacak yetkili rolü').setRequired(true))
        .addChannelOption(option => option.setName('open').setDescription('Açık destek taleplerinin oluşturulacağı kategori').setRequired(true))
        .addChannelOption(option => option.setName('close').setDescription('Kapanan destek taleplerinin oluşturulacağı kategori').setRequired(true)),

    async execute(interaction, client) {
        const channel = interaction.options.getChannel('channel');
        const role = interaction.options.getRole('role');
        const open = interaction.options.getChannel('open');
        const close = interaction.options.getChannel('close');

        if (channel.type !== ChannelType.GuildText) {
            return await interaction.reply({ content: `⚠️ \`channel\` seçeneği bir metin kanalı olmalıdır!`, ephemeral: true });
        }

        if (open.type !== ChannelType.GuildCategory) {
            return await interaction.reply({ content: '⚠️ `open` seçeneği bir kategori kanalı olmalıdır!', ephemeral: true });
        }

        if (close.type !== ChannelType.GuildCategory) {
            return await interaction.reply({ content: '⚠️ `Kapat` seçeneği bir kategori kanalı olmalıdır!', ephemeral: true });
        }

        const data = {
            channel: channel.id,
            role: role.id,
            open: open.id,
            close: close.id
        };

        fs.writeFileSync(`./database/${interaction.guildId}.json`, JSON.stringify(data, null, 4));

        const embed = new EmbedBuilder()
            .setTitle('🎫 Destek Sistemi')
            .setDescription('Destek talebi oluşturmak için aşağıdaki butona tıklayın')
            .setColor('#6104b9')
            .setFooter({ text: client.user.username, iconURL: client.user.avatarURL({ dynamic: true }) })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel('📩 Destek Talebi Oluştur')
                    .setStyle(ButtonStyle.Primary)
            );

        await channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: '✅ Destek sistemi kuruldu', ephemeral: true });
    }
}