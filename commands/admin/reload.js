const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

//Get all commands

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
commands = [];
for (const file of commandFiles) {
  const commandName = file.slice(0,-3);
  let cmdObj = {name: commandName, value: commandName}
  commands.push(cmdObj)
}
const adminCmdFiles = fs.readdirSync('./commands/admin').filter(file => file.endsWith('.js'));
for(const file of adminCmdFiles) {
  const commandName = file.slice(0,-3);
  let cmdObj = {name: commandName, value: commandName}
  commands.push(cmdObj)
}
module.exports = {
  name: 'reload',
  description: 'Reloads a command',
  usage: ['command'],
  modOnly: true,
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reload a command')
    .addStringOption(option =>
        option.setName('command')
            .setDescription('The command to reload')
            .setRequired(true)
            .addChoices(...commands)),
  execute(interaction, isMod) {
    let commandName = interaction.options.get('command')['value'];
    if (commandName == 'reload') return interaction.reply({content: 'Cannot reload the \`reload\` command', ephemeral:true});
    let command = interaction.client.commands.get(commandName);
    let adminCmd = false;
    if(!command){
      command = interaction.client.adminCommands.get(commandName);
      adminCmd = true;
    }
    if (!command) return interaction.reply({content: `There is no command with name \`${commandName}\`, ${msg.author}!`, ephemeral:true});

    commandName = command.name
    let filePath = `../${commandName}.js`;
    if(adminCmd){
      filePath = `./${commandName}.js`;
    }
    delete require.cache[require.resolve(filePath)];
    try {
	     const newCommand = require(filePath);
       if(!adminCmd) interaction.client.commands.set(newCommand.name, newCommand);
       else interaction.client.adminCommands.set(newCommand.name, newCommand);

    } catch (error) {
	     console.log(error);
	      interaction.reply({content: `There was an error while reloading a command \`${commandName}\`:\n\`${error.message}\``, ephemeral:true});
    }
    interaction.reply({content: `Command \`${commandName}\` was reloaded!`, ephemeral:true});
  }
}
