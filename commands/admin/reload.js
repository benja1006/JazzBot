const { MessageFlags } = require('discord.js');
module.exports = {
  name: 'reload',
  description: 'Reloads a command\'s logic without restarting the bot',
  cooldown: 5,
  async execute(interaction) {
    const commandName = interaction.options.getString('command', true).toLowerCase();

    const bot = interaction.client;
    const command = bot.commands.get(commandName);
    if (!command) {
      return interaction.reply({ content: `There is no command named \`${commandName}\`.`, flags: MessageFlags.Ephemeral });
    }

    delete require.cache[require.resolve(`../${commandName}.js`)];
    try {
      const newCommand = require(`../${commandName}.js`);
      bot.commands.set(newCommand.name, newCommand);
    } catch (error) {
      console.log(error);
      return interaction.reply({ content: `There was an error while reloading \`${commandName}\`:\n\`${error.message}\``, flags: MessageFlags.Ephemeral });
    }

    return interaction.reply(`Command \`${commandName}\` was reloaded! Note: this only reloads its logic — if its name, description, or options changed, re-run \`deploy-commands.js\` to update Discord's registration.`);
  },
};
