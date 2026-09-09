const { MessageFlags } = require('discord.js');
module.exports = {
  name: 'setup',
  description: 'Setup JazzBot on your server',
  cooldown: 5,
  modOnly: true,
  async execute(interaction, isMod) {
    const SQLUSERNAME = process.env.SQLUSERNAME;
    const SQLPASSWORD = process.env.SQLPASSWORD;
    const Sequelize = require('sequelize');
    const sequelize = new Sequelize('jazzbot', SQLUSERNAME, SQLPASSWORD, {
      host: 'mysql',
      dialect: 'mysql'
    });
    const Model = Sequelize.Model;
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

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'mod') {
      const role = interaction.options.getRole('role', true);
      await Servers.update({
        ManagerRole: role.id
      }, {
        where: {
          Server: interaction.guild.id
        }
      });
      return interaction.reply(`The ${role.name} role has been given moderator privileges.`);
    }

    if (subcommand === 'general') {
      const channel = interaction.options.getChannel('channel') || interaction.channel;
      await Servers.update({
        General: channel.id
      }, {
        where: {
          Server: interaction.guild.id
        }
      });
      let content = `${channel} has been set as the general channel for the server.`;
      if (Server[0].Suggest == null) {
        content += '\nIf you would like to add suggestions, please run `/setup suggestion` in the channel you would like to receive suggestions.';
      }
      return interaction.reply(content);
    }

    if (subcommand === 'suggestion') {
      const channel = interaction.options.getChannel('channel') || interaction.channel;
      await Servers.update({
        Suggest: channel.id
      }, {
        where: {
          Server: interaction.guild.id
        }
      });
      return interaction.reply(`${channel} has been set as the suggestion channel for the server.`);
    }
  },
};
