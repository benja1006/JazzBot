module.exports = {
  name: 'reload',
  description: 'Reloads a command',
  usage: ['command'],
  modOnly: true,
  reqMusic: true,
  execute(msg, args, isMod) {
    if (!args.length) return msg.channel.send(`You didn't pass any command to reload, ${msg.author}!`);
    const commandName = args[0].toLowerCase();
    if (commandName == 'reload') return msg.channel.send('Cannot reload the \`reload\` command');
    const command = msg.client.commands.get(commandName) || msg.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return msg.channel.send(`There is no command with name or alias \`${commandName}\`, ${msg.author}!`);


    delete require.cache[require.resolve(`./${commandName}.js`)];
    try {
	     const newCommand = require(`./${commandName}.js`);
	     msg.client.commands.set(newCommand.name, newCommand);
    } catch (error) {
	     console.log(error);
	      msg.channel.send(`There was an error while reloading a command \`${commandName}\`:\n\`${error.message}\``);
    }
    msg.channel.send(`Command \`${commandName}\` was reloaded!`);
  }
}
