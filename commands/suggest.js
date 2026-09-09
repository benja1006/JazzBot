const { MessageFlags } = require('discord.js');
module.exports = {
  name: 'suggest',
  description: 'Suggest something to the moderators',
  aliases: ['suggestion'],
  cooldown: 300,
  modOnly: false,
  async execute(interaction, isMod) {
    const Sequelize = require('sequelize');
    const SQLUSERNAME = process.env.SQLUSERNAME;
    const SQLPASSWORD = process.env.SQLPASSWORD;
    const Model = Sequelize.Model;
    const sequelize = new Sequelize('jazzbot', SQLUSERNAME, SQLPASSWORD, {
      host: 'mysql',
      dialect: 'mysql'
    });
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

    await Servers.sync();
    const Server = await Servers.findAll({
      where: {
        Server: interaction.guild.id
      }
    });
    if (!Server[0]) {
      return interaction.reply({ content: 'This server hasn\'t been setup properly. Please kick the bot and re add it.', flags: MessageFlags.Ephemeral });
    }

    const suggestID = Server[0].Suggest;
    if (suggestID == null) {
      return interaction.reply({ content: 'Suggestions are not yet enabled on this server.', flags: MessageFlags.Ephemeral });
    }

    const suggestChannel = interaction.guild.channels.cache.get(suggestID);
    if (!suggestChannel) {
      return interaction.reply({ content: 'The suggest channel has been incorrectly setup on this server. Please contact a mod for help.', flags: MessageFlags.Ephemeral });
    }

    const suggestion = interaction.options.getString('text', true);
    const suggestionEmbed = {
      color: isMod ? 0xde2121 : 0x34ebde,
      title: `Suggestion by ${interaction.user.tag}`,
      fields: [
        {
          name: 'UserID',
          value: interaction.user.id,
        },
        {
          name: 'Suggestion',
          value: suggestion,
        },
      ],
    };

    await suggestChannel.send({ embeds: [suggestionEmbed] });
    return interaction.reply({ content: 'Thank you for your suggestion. It has been forwarded to the mod team!', flags: MessageFlags.Ephemeral });
  },
};
