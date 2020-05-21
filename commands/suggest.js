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
  execute(msg, args) {
    if(args.length == 0){
      return msg.author.send("Please include a message in your suggestion");
    }
    //connect to mysql server
    const Sequelize = require('sequelize');
    const SQLUSERNAME = process.env.SQLUSERNAME;
    const SQLPASSWORD = process.env.SQLPASSWORD;
    const Model = Sequelize.Model;
    const sequelize = new Sequelize('jazzbot', SQLUSERNAME, SQLPASSWORD, {
      host: 'localhost',
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
        suggestID = Server[0].Suggest;
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
              name: 'Suggestion',
              value: suggestion,
            },
          ],
        };
        msg.guild.channels.get(suggestID).send({ embed: suggestionEmbed});
      });
    });

  },
};
