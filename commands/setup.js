const prefix = process.env.PREFIX + ' ';
module.exports = {
  name: 'setup',
  description: 'Setup JazzBot on your server',
  aliases: ['setup'],
  usage: ['setup (id)'],
  cooldown: 5,
  modOnly: true,
  reqMusic: false,
  execute(msg, args, isMod) {
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
        //console.log(Server[0].ID);
        if(args.length == 0){

            msg.channel.send("First, I need to know who should have mod priveleges on this bot.");
            msg.channel.send("Please type \'" + prefix +"setup mod\' followed by the id of the lowest role you would like to give mod priveledges for the bot.");
            return;

        }
        else{
          switch(args[0].toLowerCase()){
            case 'mod':
              if(args.length == 2){
                console.log(args);
                  let modRole = msg.guild.roles.cache.get(args[1]);
                  if(modRole == null){
                    return msg.channel.send("This is not a valid role id");
                  }
                  msg.channel.send("The "+ modRole.name +" role has been given moderator priveleges");
                  Servers.update({
                    ManagerRole: args[1]
                  },
                  { where: {
                    Server: msg.guild.id
                  }});

              }
              break;
            case 'general':
              if(args.length == 1){
                if(msg.channel.type != 'text'){
                  return msg.channel.send("Please use this either in the general channel, or followed by the id of the general channel");
                }
                Servers.update({
                  General: msg.channel.id
                },
                { where: {
                  Server: msg.guild.id
                }});
                msg.channel.send("This channel has been set as the general channel for the server.");
                if(Server[0].Suggest == null){
                  msg.channel.send("If you would like to add suggestions, please type \'" + prefix +"setup suggest\' in the channel you would like to receive suggestions.");
                }
                return;
              }
              else if(args.length == 2){
                msg.guild.channels.cache.find(args[2]).then(() => {
                  Servers.update({
                    General: args[2]

                  },
                  { where: {
                    Server: msg.guild.id
                  }});
                  msg.channel.send("You have updated the general channel for the server.")
                  if(Server[0].Suggest == null){
                    msg.channel.send("If you would like to add suggestions, please type \'" + prefix +"setup suggest\' in the channel you would like to receive suggestions.");
                  }
                }).catch(msg.channel.send("This is not a valid channel id"));
                return;
              }
              break;
            case 'suggestion':
            case 'suggestions':
            case 'suggest':
              if(args.length == 1){
                if(msg.channel.type != 'text'){
                  return msg.channel.send("Please use this either in the suggest channel, or followed by the id of the suggest channel");
                }
                Servers.update({
                  Suggest: msg.channel.id
                },
                { where: {
                  Server: msg.guild.id
                }});
                msg.channel.send("This channel has been set as the suggest channel for the server.");
                return;
              }
              else if(args.length == 2){
                msg.guild.channels.cache.find(args[2]).then(() => {
                  Servers.update({
                    Suggest: args[2]
                  },
                  { where: {
                    Server: msg.guild.id
                  }});
                  msg.channel.send("You have updated the suggest channel for the server.")
                }).catch(msg.channel.send("This is not a valid channel id"));
                return;
              }
            case 'togglemusic':
            case 'allowmusic':
            case 'music':
              console.log('running case music');
              let newMusic = false;
              if(args.length == 1){
                if(!Server[0].Music){
                  newMusic = true;
                }
              }
              if(args.length == 2){
                if(JSON.parse(args[1])){
                  if(Server[0].Music){
                    msg.channel.send('Music is already enabled on this server.');
                    newMusic = true;
                  }
                  else{
                    msg.channel.send('Music has been enabled on this server.');
                    newMusic = true;
                  }
                }
                if(!JSON.parse(args[1])){
                  if(!Server[0].Music){
                    msg.channel.send('Music is already disabled on this server.');
                  }
                  else{
                    msg.channel.send('Music has been disabled on this server.');
                  }
                }
                if(args[1] != 'true' && args[1] != 'false'){
                  msg.channel.send('Please only include either true or false or neither to switch the current setting.');
                }
              }
              if(newMusic != Server[0].Music){
                Servers.update({
                  Music: newMusic
                },
                { where: {
                  Server: msg.guild.id
                }}).then(() => console.log('Music has been updated'));
              }
          }
        }
      });
    });
  },
};
