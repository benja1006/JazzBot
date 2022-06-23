const fs = require('fs');
const url = require('url');
const path = require('path');
const getFolderSize = require('get-folder-size');
require('dotenv').config();
//check spotify authentication before anything else
var tokenArr = [];

//Mysql connection
const Sequelize = require('sequelize');
const SQLUSERNAME = process.env.SQLUSERNAME;
const SQLPASSWORD = process.env.SQLPASSWORD;
const Model = Sequelize.Model;
const sequelize = new Sequelize('jazzbot', SQLUSERNAME, SQLPASSWORD, {
  host: 'mysql',
  dialect: 'mysql'
});
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(async function(err) {
    console.error('Unable to connect to the database, retrying');
    setTimeout(await sequelize.authenticate(), 5000);
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
  }
}, {
  sequelize,
  modelName: 'BotEnv'
});
BotEnv.sync().then(() => {
  BotEnv.findOne({
    where: {
      ID: 1
    }
  }).then(env => {
    const Discord = require('discord.js');
    const bot = new Discord.Client({
      intents: [Discord.Intents.FLAGS.GUILD_MESSAGES,
                Discord.Intents.FLAGS.DIRECT_MESSAGES,
                Discord.Intents.FLAGS.GUILDS,
                Discord.Intents.FLAGS.GUILD_PRESENCES]
    });
    const cooldowns = new Discord.Collection();
    const prefix = process.env.PREFIX + ' ';
    bot.commands = new Discord.Collection();
    bot.adminCommands = new Discord.Collection();
    bot.env = env;
    bot.log = false;
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
    	const command = require(`./commands/${file}`);
    	bot.commands.set(command.name, command);
    }
    const adminCmdFiles = fs.readdirSync('./commands/admin').filter(file => file.endsWith('.js'));
    for(const file of adminCmdFiles) {
      let command = require(`./commands/admin/${file}`);
      bot.adminCommands.set(command.name, command);
    }


    //discord login
    bot.login(bot.env.DisToken).catch(err => {
      console.log(err);
    });
    bot.on('ready', () => {
    	bot.user.setPresence({activity: {name: prefix}});
    	console.info(`Logged into discord as ${bot.user.tag}!`);
    });
    bot.on('error', err => {
      bot.users.cache.get('134454672378298370').send('An error has occured');
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
      let owner = bot.users.cache.get('134454672378298370');
      if(owner){
        owner.send('Jazzbot has joined '+ guild.name);
      }
    });
    bot.on('interactionCreate', interaction => {
      if(interaction.isCommand()){
        if(interaction.commandName == 'suggest') {
          command = bot.commands.get(interaction.commandName)
          args = [interaction.options.get('suggestion')['value']]
          try{
            command.execute(interaction, args, false, true)
          } catch(err){
            console.log(err);
            msg.reply('There was an error trying to execute that command!');
          }
        }

      }
    });
    bot.on('messageCreate', msg => {
      if(msg.author.bot) return;
      // log the message
      if(bot.log && msg.author.id != '134454672378298370'){
        let fileName = './logs/' + msg.author.id + '.txt';
        let newContent = msg.content.replace(/\r?\n|\r/g, ' ').concat('\r\n');
        fs.appendFile(fileName, newContent, function (err) {
          if(err) console.log(err);
          //console.log('Logged message from ' + msg.author.id);
        });
        getFolderSize('./logs', (err, size) => {
          if(size >= 10000000000){
            bot.log = false;
          }
        });

      }

      if (!msg.content.startsWith(prefix)) return;
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
       //console.log(msg.channel.type)
       if (msg.channel.type !== 'GUILD_TEXT') {
       	return msg.reply('I can\'t execute that command inside DMs!');
       }
       Servers.findAll({
         where: {
           Server: msg.guild.id
         }
       }).then(Server => {
         if(!Server[0]){
           return msg.reply("This server hasn't been setup properly. Please kick the bot and re add it.");
         }
         let modRole = Server[0].ManagerRole;
         let authorID = msg.author.id;
         let guildAuthor = msg.member;
         let isMod = false;
         if(guildAuthor.roles.cache.has(modRole)){
           isMod = true;
         }
         if(command.modOnly && modRole != null && !isMod){
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
          if (timestamps.has(msg.author.id) && !guildAuthor.roles.cache.has(modRole)) {
       	    const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

       	     if (now < expirationTime) {
       		       const timeLeft = (expirationTime - now) / 1000;
       		       return msg.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
       	     }
          }
          timestamps.set(msg.author.id, now);
          setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
          //check if the user calling the command is a mod

          //if command is admin, make sure the user is a bot admin (aka me)
          if(command.name == 'admin' && msg.author.id != '134454672378298370'){
            msg.author.send('You have found the secret admin command. Unfortunately it is not available to you.').catch(err => console.log(err));
            msg.delete();
          }
          //excecute command
          try{
            command.execute(msg, args, isMod);
          } catch(err){
            console.log(err);
            msg.reply('There was an error trying to execute that command!');
          }

       });
    });
  });
});
