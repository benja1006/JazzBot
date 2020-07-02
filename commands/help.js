const prefix = process.env.PREFIX + ' ';
module.exports = {
  name: 'help',
  description: 'List all of my commands or info about a specific command',
  aliases: ['commands'],
  usage: ['command name'],
  cooldown: 5,
  execute(msg, args, isMod) {
    const data = [];
    const { commands } = msg.client;
    if (!args.length){
      data.push('Here\'s a list of all my commands:');
      if(!isMod){
        data.push(commands.filter(command => !command.modOnly).map(command => command.name).join(', '));
      }
      else{
        data.push(commands.map(command => command.name).join(', '));
      }
      data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);
      if (msg.channel.type === 'text'){
        msg.delete(5000);
      }
      msg.author.send(data, { split: true })
	    .then(() => {
		       if (msg.channel.type === 'dm') return;
	    })
	    .catch(error => {
		      console.error(`Could not send help DM to ${msg.author.tag}.\n`, error);
	    });
    }
    if(!args.length){
      return;
    }
    const name = args[0].toLowerCase();
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

    if (!command) {
      if (msg.channel.type === 'text'){
        msg.delete(5000);
      }
        return msg => msg.channel.send('that\'s not a valid command!');
      }

    data.push(`Name: ${command.name}`);

    if (command.aliases) data.push(`Aliases: ${command.aliases.join(', ')}`);
    if (command.description) data.push(`Description: ${command.description}`);
    if (command.usage) data.push(`Usage: ${prefix}${command.name} ${command.usage}`);

    data.push(`Cooldown: ${command.cooldown || 3} second(s)`);

   if (msg.channel.type === 'text'){
     msg.delete(5000);
   }
   return msg.channel.send(data, { split: true });
 },
};
