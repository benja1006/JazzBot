const prefix = process.env.PREFIX + ' ';
const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
  name: 'setup',
  description: 'Setup JazzBot on your server',
  aliases: ['setup'],
  usage: ['/setup setting (id)'],
  cooldown: 5,
  modOnly: true,
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Setup JazzBot')
    .addStringOption(option =>
        option.setName('setting')
            .setDescription('What option you would like to set')
            .setRequired(true)
            .setChoices(
              {name: 'Mod Role ID', value: 'mod'},
              {name: 'General Channel ID', value: 'general'},
              {name: 'Suggest Channel ID', value: 'suggest'}
            ))
    .addIntegerOption(option =>
        option.setName('id')
            .setDescription('The ID input. If omited the channel called in will be used.')),
  execute(interaction, isMod) {
    const SQLUSERNAME = process.env.SQLUSERNAME;
    const SQLPASSWORD = process.env.SQLPASSWORD;
    const prefix = process.env.PREFIX + ' ';
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

    Servers.sync().then(() => {
      Servers.findAll({
        where: {
          Server: interaction.guild.id
        }
      }).then(Server => {
        if(!Server[0]){
          return interaction.reply({content: "This server hasn't been setup properly. Please kick the bot and re add it.", ephemeral:true});
        }

        switch(interaction.options.get('setting')['value']){
          case 'mod':
            if(!interaction.options.get('id')) return interaction.reply({content: 'Please enter the ID of the role you wish to be mod.', ephemeral:true})
            let modRole = interaction.guild.roles.cache.get(interaction.options.get('id'));
            if(modRole == null){
              return interaction.reply({content: "This is not a valid role id", ephemeral:true});
            }
            interaction.reply({content: "The "+ modRole.name +" role has been given moderator priveleges", ephemeral:true});
            Servers.update({
              ManagerRole: interaction.options.get('id')
            },
            { where: {
              Server: interaction.guild.id
            }});
            break;
          case 'general':
            if(!interaction.options.get('id')){
              if(interaction.channel.type != 'GUILD_TEXT'){
                return interaction.reply({content: "Please use this either in the general channel, or followed by the id of the general channel", ephemeral:true});
              }
              Servers.update({
                General: interaction.channel.id
              },
              { where: {
                Server: interaction.guild.id
              }});
              let response = "This channel has been set as the general channel for the server.";
              if(Server[0].Suggest == null){
                response = response.concat(" If you would like to add suggestions, please type \'" + prefix +"setup suggest\' in the channel you would like to receive suggestions.");
              }
              interaction.reply({content: response, ephemeral:true});
              return;
            }
            else{
              if(interaction.guild.channels.cache.has(interaction.options.get('id'))){
                Servers.update({
                  General: interaction.options.get('id')

                },
                { where: {
                  Server: interaction.guild.id
                }});
                let reponse = "You have updated the general channel for the server.";
                if(Server[0].Suggest == null){
                  response = response.concat("If you would like to add suggestions, please type \'" + prefix +"setup suggest\' in the channel you would like to receive suggestions.");
                }
                return interaction.reply({content: response, ephemeral:true});
              }
              else{
                interaction.reply({content: "This is not a valid channel id", ephemeral:true});
              }
              return;
            }
            break;
          case 'suggest':
            if(!interaction.options.get('id')){
              if(interaction.channel.type != 'GUILD_TEXT'){
                return interaction.reply({content: "Please use this either in the suggest channel, or followed by the id of the suggest channel", ephemeral:true});
              }
              Servers.update({
                Suggest: interaction.channel.id
              },
              { where: {
                Server: interaction.guild.id
              }});
              interaction.reply({content: "This channel has been set as the suggest channel for the server.", ephemeral:true});
              return;
            }
            else{
              if(interaction.guild.channels.cache.has(interaction.options.get('id'))){
                Servers.update({
                  Suggest: interaction.options.get('id')
                },
                { where: {
                  Server: interaction.guild.id
                }});
                interaction.reply({content: "You have updated the suggest channel for the server.", ephemeral:true});
              }
              else{
                interaction.reply({content: "This is not a valid channel id", ephemeral:true});
              }
              return;
            }
        }
      });
    });
  },
};
