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
    const bot = interaction.client
    const token = bot.env.DisToken;
    const clientId = bot.user.id;
    const guildId = interaction.guild.id;
    const rest = new REST({version: '9'}).setToken(token);
    let commands = bot.commands.map(command => command.data.toJSON());
    let adminCommands = bot.adminCommands.map(command => command.data.toJSON());
    (async () => {
    	try {
    		interaction.reply({content: 'Started refreshing application (/) commands.', ephemeral: true});
    		await rest.put(
    			Routes.applicationCommands(clientId),
    			{ body: commands },
    		);
        await rest.put(
          Routes.applicationGuildCommands(clientId, guildId),
          { body: adminCommands},
        );

    		interaction.reply({content: 'Successfully reloaded application (/) commands.', ephemeral: true});
    	} catch (error) {
    		console.error(error);
    	}
    })();
  }
};
