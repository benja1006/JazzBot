const prefix = process.env.PREFIX + ' ';
module.exports = {
  name: 'newCmd',
  description: 'Creates a slash command /suggest',
  aliases: ['newcmd'],
  usage: [''],
  execute(msg, args, isMod) {
    const data = {
      name: 'suggest',
      data: 'Make a suggestion for the mods.'
    };
    const command = await msg.guild.commands.create(data);
    msg.reply('Command ' + data['name'] + ' created')
  }
};
