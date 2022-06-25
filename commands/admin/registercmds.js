const prefix = process.env.PREFIX + ' ';
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
  name: 'registercmds',
  description: 'Registers slash commands',
  aliases: ['registercmd'],
  usage: [''],
  data: new SlashCommandBuilder()
    .setName('registercmds')
    .setDescription('Registers slash commands to discord servers'),
  execute(interaction, isMod, slash = true) {
    if(slash){
      const token = interaction.client.env.DisToken;
      const clientId = interaction.client.user.id;
      const guildId = interaction.guild.id;
    }
    else{
      const token = msg.guild.client.env.DisToken;
      const clientId = msg.guild.client.user.id;
      const guildId = msg.guild.id;
    }
    const rest = new REST({version: '9'}).setToken(token);
    let commands = bot.commands.map(command => command.data.toJSON());
    let adminCommands = bot.adminCommands.map(command => command.data.toJSON());
    (async () => {
    	try {
    		console.log('Started refreshing application (/) commands.');
    		await rest.put(
    			Routes.applicationCommands(clientId),
    			{ body: commands },
    		);
        await rest.put(
          Routes.applicationGuildCommands(clientId, guildId),
          { body: adminCommands},
        );

    		console.log('Successfully reloaded application (/) commands.');
    	} catch (error) {
    		console.error(error);
    	}
    })();
  }
};
