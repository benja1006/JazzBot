const fs = require('fs');
const url = require('url');
const path = require('path');
require('dotenv').config();
//Mysql connection
const Sequelize = require('sequelize');
const SQLUSERNAME = process.env.SQLUSERNAME;
const SQLPASSWORD = process.env.SQLPASSWORD;
const Model = Sequelize.Model;
const sequelize = new Sequelize('jazzbot', SQLUSERNAME, SQLPASSWORD, {
  host: 'localhost',
  dialect: 'mysql'
});
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
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
class BotEnv extends Model {}
BotEnv.init({
  ID: {
    type: Sequelize.INTEGER(4),
    primaryKey: true,
    autoIncrement: true
  },
  DisToken: {
    type: Sequelize.STRING(59),
    autoIncrement: false
  },
  YTKey: {
    type: Sequelize.STRING(59),
    autoIncrement: false
  },
  SpotifyID: {
    type: Sequelize.STRING(59),
    autoIncrement: false
  },
  SpotifySecret: {
    type: Sequelize.STRING(59),
    autoIncrement: false
  },
}, {
  sequelize,
  modelName: 'BotEnv'
});
BotEnv.sync().then(() => {
  BotEnv.findAll({
    where: {
      ID: 1
    }
  }).then(env => {
    DisToken = env[0].DisToken;
    YTKey = env[0].YTKey;
    SpotifyID = env[0].SpotifyID;
    SpotifySecret = env[0].SpotifySecret;

    //discord setup
    const Discord = require('discord.js');
    const bot = new Discord.Client();
    const cooldowns = new Discord.Collection();
    const prefix = process.env.PREFIX + ' ';
    bot.commands = new Discord.Collection();
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
    	const command = require(`./commands/${file}`);
    	bot.commands.set(command.name, command);
    }


    //discord login
    bot.login(DisToken);
    bot.on('ready', () => {
    	bot.user.setPresence({game: {name: '!jazz'}});
    		console.info(`Logged into discord as ${bot.user.tag}!`);
        //const defaultChannel = bot.channels.get(process.env.DEFAULT);
    });

    //When added to a new server
    bot.on('guildCreate', guild => {
      //Start mysql connection
    	 //add server to mysql table
      Servers.sync().then(() => {
        Servers.create({
          Server: guild.id
        });
      });
      console.log(guild.id);
      let defaultChannel = "";
      guild.channels.forEach((channel) => {
        if(channel.type == "text" && defaultChannel == "") {
          if(channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
            defaultChannel = channel;
          }
        }
      })
      //defaultChannel will be the channel object that the bot first finds permissions for
      defaultChannel.send('Hello! Thank you for adding JazzBot to your server. Please type \'!jazz Setup\' in a channel on this server to begin the setup process.');
      bot.users.get('134454672378298370').send('Jazzbot has joined '+ guild.name);
    });
    bot.on('message', msg => {
      if (!msg.content.startsWith(prefix) || msg.author.bot) return;
    	//back to normal command code
      const args = msg.content.slice(prefix.length).split(/ +/);
      const commandName = args.shift().toLowerCase();
      console.info(`${msg.author.username} Called command: ${commandName}`);
      //check if command doesn't exist
      if (!bot.commands.has(commandName)){
        msg.author.send(`That command doesn't exist. try ${prefix}help for help`)
        return;
      }
      //cooldown code
      const command = bot.commands.get(commandName);


       //executing command
       if (command.guildOnly && msg.channel.type !== 'text') {
       	return msg.reply('I can\'t execute that command inside DMs!');
       }
       //// FIXME: make modOnly work
       Servers.findAll({
         where: {
           Server: msg.guild.id
         }
       }).then(Server => {
         let modRole = Server[0].ManagerRole;
         let authorID = msg.author.id;
         let guildAuthor = msg.guild.members.get(msg.author.id);
         if(modRole == null && command.modOnly){
           return msg.reply('This is a Mod Only Command. Please assign a modRole to use it.');
         }
         if(guildAuthor.roles == null){
           return msg.reply('This command can only be used by a moderator.');
         }
         if(command.modOnly && guildAuthor.roles.get(modRole) == null){
      		 return msg.reply('This command can only be used by a moderator');
      	 }
         //Cooldowns
         if (!cooldowns.has(command.name)) {
       	   cooldowns.set(command.name, new Discord.Collection());
          }

          const now = Date.now();
          const timestamps = cooldowns.get(command.name);
          const cooldownAmount = (command.cooldown || 3) * 1000;
          //if cooldown is running and author is not mod
          if (timestamps.has(msg.author.id) && guildAuthor.roles != null && guildAuthor.roles.find(modRole) == null) {
       	    const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

       	     if (now < expirationTime) {
       		       const timeLeft = (expirationTime - now) / 1000;
       		       return msg.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
       	     }
          }
          timestamps.set(msg.author.id, now);
          setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);

          //command execution
         try {
           command.execute(msg, args);
         } catch (error) {
           console.error(error);
           msg.reply('There was an error trying to execute that command!');
         }
       });
    });
  });
})
