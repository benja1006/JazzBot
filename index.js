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
    bot.once('ready', () => {
    	bot.user.setPresence({activities: [{name: prefix}], status: 'online'});
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
        Servers.findAll({
          where: {
            Server: guild.id
          }
        }).then(Server => {
          if(!Server[0]){
            Servers.create({
              Server: guild.id
            });
          }
        });
      });
      console.log(guild.id);
      let owner = bot.users.cache.get('134454672378298370');
      if(owner){
        owner.send('Jazzbot has joined '+ guild.name);
      }
    });
    bot.on('interactionCreate', async interaction => {

      if(!interaction.isCommand()) return;

      const {commandName} = interaction;

      let command  = bot.commands.get(commandName);

      if(!command){
        command = bot.adminCommands.get(commandName)
      }

      if(!command) return;

      //isMod
      Servers.sync().then(() => {
        Servers.findAll({
          where: {
            Server: interaction.guild.id
          }
        }).then(Server => {
          if(!Server[0]){
            return interaction.reply({content: 'This server has been improperly set up. Please kick the bot and re-add it.', ephemeral:true});
          }
          let modRole = Server[0].ManagerRole;
          const isMod = interaction.member.roles.cache.has(modRole);
          //Cooldowns
          if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Discord.Collection());
           }

           const now = Date.now();
           const timestamps = cooldowns.get(command.name);
           const cooldownAmount = (command.cooldown || 3) * 1000;
           //if cooldown is running and author is not mod
           if (timestamps.has(interaction.user.id) && !isMod) {
             const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

              if (now < expirationTime) {
                  const timeLeft = (expirationTime - now) / 1000;
                  return interaction.reply({content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`, ephemeral:true});
              }
           }
           timestamps.set(interaction.user.id, now);
           setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

           //Run command
          try{
            command.execute(interaction, isMod);
          } catch(err){
            console.log(err);
            interaction.reply({content: 'There was an error trying to execute that command!', ephemeral:true});
          }
        });
      });
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
      if(msg.content == `${prefix}register` && msg.author.id == '134454672378298370' ){
        const command = bot.adminCommands.get('registercmds');
        command.execute(msg, true, false);
      }
    });
  });
});
