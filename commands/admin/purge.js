const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  name: 'purge',
  description: 'Purges disconnected servers from DB',
  aliases: [''],
  usage: ['/purge (confirm)'],
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Purges disconnected servers from DB')
    .addStringOption(option =>
      option.setName('confirm')
      .setDescription('Confirm the purge')
      .setRequired(false)
      ),
  execute(interaction, isMod) {
    
  }
}
