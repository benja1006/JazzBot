const prefix = process.env.PREFIX + ' ';
const Discord = require('discord.js');
module.exports = {
  name: 'suggest',
  description: 'Suggest something to the Moderators',
  aliases: ['suggestion'],
  usage: ['suggest suggestion'],
  cooldown: 0,
  guildOnly: true,
  modOnly: false,
  reqMusic: false,
  execute(msg, args, isMod) {
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
      },
      Music: {
        type: Sequelize.BOOLEAN,
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
        suggestID = Server[0].Suggest;
        if(suggestID == null){
          return msg.reply("Suggestions are not yet enabled on this server.");
        }
        var suggestion = args[0];
        for(i = 1; i<args.length; i++){
          suggestion = suggestion.concat(" ", args[i]);
        }
        msg.delete();
        msg.author.send("Thank you for your suggestion. It has been forwarded to the mod team!").catch();
        const suggestionEmbed = {
          color: 0x34ebde,
          title: "Suggestion by " + msg.author.tag,
          fields: [
            {
              name: 'UserID',
              value: msg.author.id,
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
        msg.guild.channels.cache.get(suggestID).send({ embed: suggestionEmbed});
      });
    });

  },
};
