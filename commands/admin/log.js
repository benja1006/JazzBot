const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
  name: 'log',
  description: 'Used to toggle logging',
  aliases: [''],
  usage: ['/log true/false'],
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
  execute(msg, args) {
    switch(args[0]){
      case 'on':
      case 'true':
        msg.client.log = true;
        msg.channel.send('Logging turned on');
        break;
      case 'false':
      case 'off':
        msg.client.log = false;
        msg.channel.send('Logging turned off');
    }
  },
}
