const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  name: 'log',
  description: 'Used to toggle logging',
  aliases: [''],
  usage: ['/log On/Off'],
  data: new SlashCommandBuilder()
    .setName('log')
    .setDescription('Enable or disable logging')
    .addStringOption(option =>
        option.setName('position')
        .setDescription('On or off')
        .setChoices(
          {name: 'On', value: 'on'},
          {name: 'Off', value: 'off'}
        )),
  execute(interaction, isMod) {
    switch(interaction.options.get('position').value){
      case 'on':
      case 'true':
        interaction.client.log = true;
        interaction.reply('Logging turned on');
        break;
      case 'false':
      case 'off':
        interaction.client.log = false;
        interaction.reply({content: 'Logging turned off', ephemeral: true});
    }
  },
}
