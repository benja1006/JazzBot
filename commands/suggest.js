const prefix = process.env.PREFIX + ' ';
const Discord = require('discord.js');
module.exports = {
  name: 'suggest',
  description: 'Suggest something to the Moderators',
  aliases: ['suggestion'],
  usage: ['suggest suggestion'],
  cooldown: 300,
  guildOnly: true,
  modOnly: false,
  execute(msg, args, isMod, slash) {
    if(args.length == 0){
      return msg.author.send("Please include a message in your suggestion");
    }
    //connect to mysql server
    const Sequelize = require('sequelize');
    const SQLUSERNAME = process.env.SQLUSERNAME;
    const SQLPASSWORD = process.env.SQLPASSWORD;
    const Model = Sequelize.Model;
    const sequelize = new Sequelize('jazzbot', SQLUSERNAME, SQLPASSWORD, {
      host: 'mysql',
      dialect: 'mysql'
    });
    //create Server model
    class Servers extends Model {}
    Servers.init({
      ID: {
        type: Sequelize.INTEGER(4),
        primaryKey: true,
        autoIncrement: true
      },
      Server: {
        type: Sequelize.BIGINT(18),
        autoIncrement: false
      },
      General: {
        type: Sequelize.BIGINT(18),
        autoIncrement: false
      },
      Suggest: {
        type: Sequelize.BIGINT(18),
        autoIncrement: false
      },
      ManagerRole: {
        type: Sequelize.BIGINT(18),
        autoIncrement: false
      }
    }, {
      sequelize,
      modelName: 'Servers'
    });
    Servers.sync().then(() => {
      Servers.findAll({
        where: {
          Server: msg.guild.id
        }
      }).then(Server => {
        if(!Server[0]){
          return msg.reply("This server hasn't been setup properly. Please kick the bot and re add it.");
        }
        suggestID = Server[0].Suggest;
        if(suggestID == null){
          return msg.reply("Suggestions are not yet enabled on this server.");
        }
        if(msg.guild.channels.cache.get(!suggestID)){
          return msg.reply("The suggest channel has been incorrectly setup on this server. Please contact a mod for help.");
        }
        var suggestion = args[0];
        //console.log(args)
        for(i = 1; i<args.length; i++){
          suggestion = suggestion.concat(" ", args[i]);
        }
        if(!slash){
          msg.delete();
          const author = msg.author;
        }
        let isMod = false;
        const author = msg.user;
        let modRole = Server[0].ManagerRole;
        if(modRole != null && msg.member.roles.cache.has(modRole)){
          isMod = true;
        }
        msg.reply({content: "Thank you for your suggestion. It has been forwarded to the mod team!", ephemeral: true}).catch();

        const suggestionEmbed = {
          color: 0x34ebde,
          title: "Suggestion by " + author.tag.toString(),
          fields: [
            {
              name: 'UserID',
              value: author.id,
            },
            {
              name: 'Suggestion',
              value: suggestion,
            },
          ],
        };
        if(isMod){
          suggestionEmbed.color = 0xde2121;
        }
        msg.guild.channels.cache.get(suggestID).send({ embeds: [suggestionEmbed]});
      });
    });

  },
};
