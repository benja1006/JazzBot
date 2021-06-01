module.exports = {
  name: 'log',
  description: 'Used to toggle logging',
  aliases: [''],
  usage: ['log true/false'],
  execute(msg, args) {
    switch(args[0]){
      case 'on':
      case 'true':
        msg.client.log = true;
        msg.channel.send('Logging turned on');
        break;
      case 'false':
      case 'off':
        msg.client.log = false;
        msg.channel.send('Logging turned off');
    }
  },
}
