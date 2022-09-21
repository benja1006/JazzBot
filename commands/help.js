const prefix = process.env.PREFIX + ' ';
const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
  name: 'help',
  description: 'List all of my commands or info about a specific command',
  aliases: ['commands'],
  usage: ['command name'],
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('JazzBot help')
    .addStringOption(option =>
      option.setName('command')
          .setDescription('A command you want help with (optional)')),
  async execute(interaction, isMod) {
    const data = [];
    const { commands } = interaction.client;
    //if not command is specified
    if (!interaction.options.get('command')){
      data.push('Type / for a list of all my commands.');
      data.push(`You can type \`\/help [command name]\` to get info on a specific command!`);
      interaction.reply({content: data.join('\n'), ephemeral:true});
      return;
    }
    const name = interaction.options.get('command').value
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
    //If there is no command with that name
    if (!command) {
        return interaction.reply({content: `The command \`${name}\` doesn\'t exist`, ephemeral: true});
      }
    //Build the response
    data.push(`Name: ${command.name}`);

    if (command.aliases) data.push(`Aliases: ${command.aliases.join(', ')}`);
    if (command.description) data.push(`Description: ${command.description}`);
    if (command.usage) data.push(`Usage: ${command.usage}`);

    data.push(`Cooldown: ${command.cooldown || 3} second(s)`);

   return interaction.reply({content: data.join('\n'), ephemeral: true});
 },
};
