module.exports = {
  name: 'reload',
  description: 'Reloads an admin command',
  usage: ['command'],
  modOnly: true,
  reqMusic: false,
  execute(msg, args, isMod) {
    if (!args.length) return msg.channel.send(`You didn't pass any command to reload, ${msg.author}!`);
    const commandName = args[0].toLowerCase();
    if (commandName == 'reload') return msg.channel.send('Cannot reload the \`reload\` command');
    const command = msg.client.adminCommands.get(commandName) || msg.client.adminCommands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return msg.channel.send(`There is no command with name or alias \`${commandName}\`, ${msg.author}!`);


    delete require.cache[require.resolve(`./admin/${commandName}.js`)];
    try {
	     const newCommand = require(`./${commandName}.js`);
	     msg.client.adminCommands.set(newCommand.name, newCommand);
    } catch (error) {
	     console.log(error);
	      msg.channel.send(`There was an error while reloading a command \`${commandName}\`:\n\`${error.message}\``);
    }
    msg.channel.send(`Command \`${commandName}\` was reloaded!`);
  }
}
