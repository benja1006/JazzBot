const prefix = process.env.PREFIX + ' ';
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
  name: 'newcmd',
  description: 'Creates a slash command /suggest',
  aliases: ['newcmd'],
  usage: [''],
  execute(msg, args, isMod) {
    const token = msg.guild.client.env.DisToken;
    const clientId = msg.guild.client.user.id;
    const rest = new REST({version: '9'}).setToken(token);
    const cmd = new SlashCommandBuilder()
      .setName('suggest')
      .setDescription('Make a suggestion for the mods.')
      .addStringOption(option =>
        option.setName('suggestion')
              .setDescription('The suggestion text')
              .setRequired(true));

      const commands = [
        new SlashCommandBuilder()
          .setName('suggest')
          .setDescription('Make a suggestion for the mods.')
          .addStringOption(option =>
            option.setName('suggestion')
                  .setDescription('The suggestion text')
                  .setRequired(true))
      ].map(command => command.toJSON());
    (async () => {
    	try {
    		console.log('Started refreshing application (/) commands.');

    		await rest.put(
    			Routes.applicationCommands(clientId),
    			{ body: commands },
    		);

    		console.log('Successfully reloaded application (/) commands.');
    	} catch (error) {
    		console.error(error);
    	}
    })();
  }
};
