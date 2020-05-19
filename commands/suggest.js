const prefix = process.env.PREFIX + ' ';
const SUGGEST = process.env.SUGGEST;
const Discord = require('discord.js');
module.exports = {
  name: 'suggest',
  description: 'Suggest something to the Moderators',
  aliases: ['suggestion'],
  usage: ['suggest suggestion'],
  cooldown: 300,
  guildOnly: true,
  modOnly: false,
  execute(msg, args) {
    if(args.length == 0){
      return msg.author.send("Please include a message in your suggestion");
    }
    var suggestion = args[0];
    for(i = 1; i<args.length; i++){
      suggestion = suggestion.concat(" ", args[i]);
    }
    msg.delete();
    msg.author.send("Thank you for your suggestion. It has been forwarded to the mod team!").catch();
    const exampleEmbed = {
      color: 0x34ebde,
      title: "Suggestion by " + msg.author.tag,
      fields: [
        {
          name: 'Suggestion',
          value: suggestion,
        },
      ],
    };
    msg.guild.channels.get(SUGGEST).send({ embed: exampleEmbed});
  },
};
