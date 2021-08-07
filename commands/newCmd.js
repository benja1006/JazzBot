const prefix = process.env.PREFIX + ' ';
module.exports = {
  name: 'newcmd',
  description: 'Creates a slash command /suggest',
  aliases: ['newcmd'],
  usage: [''],
  execute(msg, args, isMod) {
    const data = {
      name: 'suggest',
      description: 'Make a suggestion for the mods.',
      options: [{
        name: 'suggestion',
        type: 'STRING',
        description: 'The suggestion to be forwarded to the mods.',
        required: true
      }]
    };
    msg.guild.commands.create(data).then(command => {
      //console.log(command)
      return msg.reply('Command ' + command + ' created')
    });
  }
};
