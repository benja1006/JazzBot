const { MessageFlags } = require('discord.js');
module.exports = {
  name: 'help',
  description: 'List all of my admin commands or info about a specific command',
  aliases: ['commands'],
  cooldown: 5,
  async execute(interaction) {
    const commands = interaction.client.adminCommands;
    const query = interaction.options.getString('command');

    if (!query) {
      const lines = ['Here\'s a list of all my admin commands:'];
      lines.push(commands.map(command => command.name).join(', '));
      lines.push('\nYou can send `/admin help command:<name>` to get info on a specific command!');
      return interaction.reply({ content: lines.join('\n'), flags: MessageFlags.Ephemeral });
    }

    const name = query.toLowerCase();
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
    if (!command) {
      return interaction.reply({ content: 'That\'s not a valid command!', flags: MessageFlags.Ephemeral });
    }

    const lines = [`Name: ${command.name}`];
    if (command.aliases) lines.push(`Aliases: ${command.aliases.join(', ')}`);
    if (command.description) lines.push(`Description: ${command.description}`);
    lines.push(`Cooldown: ${command.cooldown || 3} second(s)`);
    return interaction.reply({ content: lines.join('\n'), flags: MessageFlags.Ephemeral });
  },
};
