const prefix = process.env.PREFIX + ' ';
const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
  name: 'suggest',
  description: 'Suggest something to the Moderators',
  aliases: ['suggestion'],
  usage: ['/suggest suggestion'],
  cooldown: 300,
  guildOnly: true,
  modOnly: false,
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Make a suggestion for the mods.')
    .addStringOption(option =>
      option.setName('suggestion')
            .setDescription('The suggestion text')
            .setRequired(true)),
  execute(interaction, isMod) {
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
          Server: interaction.guild.id
        }
      }).then(Server => {
        if(!Server[0]){
          return interaction.reply({content: "This server hasn't been setup properly. Please kick the bot and re add it.", ephemeral:true});
        }
        suggestID = Server[0].Suggest;
        if(suggestID == null){
          return interaction.reply({content: 'Suggestions are not yet enabled on this server.', ephemeral:true});
        }
        if(interaction.guild.channels.cache.get(!suggestID)){
          return interaction.reply("The suggest channel has been incorrectly setup on this server. Please contact a mod for help.");
        }
        var suggestion = interaction.options.get('suggestion')['value'];
        //console.log(args)
        let modRole = Server[0].ManagerRole;
        let tag = interaction.user.tag;
        let id = interaction.user.id;
        interaction.reply({content: "Thank you for your suggestion. It has been forwarded to the mod team!", ephemeral: true}).catch();
        const suggestionEmbed = {
          color: 0x34ebde,
          title: "Suggestion by " + tag,
          fields: [
            {
              name: 'UserID',
              value: id,
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
        msg.guild.channels.cache.get(suggestID).send({ embeds: [suggestionEmbed]}).catch(err => {
          interaction.user.send("Jazzbot doesn't have access to the suggest channel on this server. Please DM a mod to let them know.");
        });
      });
    });

  },
};
