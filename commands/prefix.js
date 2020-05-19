const fs = require('fs');
module.exports = {
  name: 'prefix',
  cooldown: 0,
  alias: [''],
  usage: ['optional: new prefix'],
  modOnly: true,
  execute(msg, args){
    const prefix = process.env.PREFIX;
    if (!args.length){
      msg.channel.send(`The current prefix is \`${prefix}\``);
      msg.channel.send(`To set a new prefix, type \`${prefix}prefix\` followed by your desired prefix`)
      return;
    }
    if (args.length != 1){
      msg.channel.send(`Please only include the new desired prefix`);
      return;
    }
    fs.readFile('./.env', 'utf-8', (err, data) => {
      if (err){
        return console.log(err);
      }
      var newPrefix = args[0];
      data = data.split("\n");
      data[0] = `PREFIX=${newPrefix}`;
      var newFile = '';
      for (var i = 0; i<data.length; i++){
        newFile = newFile.concat(`${data[i]}\n`);
      }
      fs.writeFile('./.env', newFile, (err, data) => {
        if (err){
          return console.log(err);
        }
        return msg.channel.send(`Prefix has been updated to ${newPrefix}`);
      });

    });
  }

}
