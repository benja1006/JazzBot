const { MessageFlags } = require('discord.js');
module.exports = {
  name: 'admin',
  description: 'Admin-only commands for JazzBot',
  cooldown: 0,
  modOnly: true,
  async execute(interaction) {
    const bot = interaction.client;
    const subcommand = interaction.options.getSubcommand();
    const command = bot.adminCommands.get(subcommand);
    if (!command) {
      return interaction.reply({ content: 'That admin command doesn\'t exist. Try /admin help for help.', flags: MessageFlags.Ephemeral });
    }
    try {
      await command.execute(interaction);
    } catch (err) {
      console.log(err);
      return interaction.reply({ content: 'There was an error trying to execute that command!', flags: MessageFlags.Ephemeral });
    }
  },
};
