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
    //if not command is specified
    if (!args.length){
      data.push('Here\'s a list of all my commands:');
      data.push(commands.filter(command => !command.modOnly && !command.reqMusic).map(command => command.name).join(', '));
      if(isMod){
        data.push(commands.filter(command => command.modOnly && command.name != 'admin').map(command => command.name).join(', '));
      }
      data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);
      if (msg.channel.type === 'GUILD_TEXT'){
        msg.delete();
      }
      msg.author.send(data.join('\n'))
	    .then(() => {
		       if (msg.channel.type === 'DM') return;
	    })
	    .catch(error => {
		      console.error(`Could not send help DM to ${msg.author.tag}.\n`, error);
	    });
      return;
    }
    const name = args[0].toLowerCase();
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
    //If there is no command with that name
    if (!command) {
      if (msg.channel.type === 'GUILD_TEXT'){
        msg.delete();
      }
        return msg => msg.channel.send({content: 'that\'s not a valid command!', ephemeral: true});
      }
    //Build the response
    data.push(`Name: ${command.name}`);

    if (command.aliases) data.push(`Aliases: ${command.aliases.join(', ')}`);
    if (command.description) data.push(`Description: ${command.description}`);
    if (command.usage) data.push(`Usage: ${prefix}${command.name} ${command.usage}`);

    data.push(`Cooldown: ${command.cooldown || 3} second(s)`);

   if (msg.channel.type === 'GUILD_TEXT'){
     msg.delete();
   }
   const suggestionEmbed = {
     color: 0x41444a,
     title: 'Help',
     field: []
   }
   for(string in data){
     suggestionEmbed.field.push({
       name: '',
       value: string,
       inline: true
     });
   }
   console.log(suggestionEmbed)
   return msg.channel.send({embeds: [suggestionEmbed], ephemeral: true});
 },
};
