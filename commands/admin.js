const prefix = process.env.PREFIX + ' ';
module.exports = {
  name: 'admin',
  description: 'Admin commands for jazzBot',
  aliases: [''],
  usage: ['admin command'],
  cooldown: 0,
  reqMusic: false,
  modOnly: true,
  execute(msg, args) {
    const bot = msg.client;
    if(!args.length >= 1) {
      return msg.reply('Please include an admin command');
    }
    const commandName = args.shift().toLowerCase();
    if(!bot.adminCommands.has(commandName)) {
      return msg.reply(`That command does not exist. Try ${prefix}admin help for help`);
    }
    const command = bot.adminCommands.get(commandName);
    try{
      command.execute(msg, args);
    }
      catch(err) {
      console.log(err);
      msg.reply('There was an error trying to execute that command!');
    }
  },
};
