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
    type: Sequelize.STRING(128),
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
    //discord setup
    const { Client, GatewayIntentBits, Collection, MessageFlags, ActivityType } = require('discord.js');
    const { publicCommands } = require('./commands/registry.js');
    const OWNER_ID = '134454672378298370';
    const ADMIN_GUILD_ID = process.env.ADMIN_GUILD_ID;
    const bot = new Client({ intents: [GatewayIntentBits.Guilds] });
    const cooldowns = new Collection();
    bot.commands = new Collection();
    bot.adminCommands = new Collection();
    bot.env = env;
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js') && file !== 'registry.js');
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
    	bot.user.setPresence({ activities: [{ name: '/help', type: ActivityType.Playing }] });
    		console.info(`Logged into discord as ${bot.user.tag}!`);
    });
    bot.on('error', err => {
      bot.users.cache.get(OWNER_ID).send('An error has occured');
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
      guild.commands.set(publicCommands).catch(err => console.log(err));
      bot.users.cache.get(OWNER_ID).send('Jazzbot has joined '+ guild.name);
    });
    bot.on('interactionCreate', async interaction => {
      if (!interaction.isChatInputCommand()) return;

      const commandName = interaction.commandName;
      console.info(`${interaction.user.username} called command: ${commandName}`);

      if (!bot.commands.has(commandName)) {
        return interaction.reply({ content: 'That command doesn\'t exist. Try /help for help', flags: MessageFlags.Ephemeral });
      }
      const command = bot.commands.get(commandName);

      //owner-only, single-guild gate for /admin — can't be expressed as a Discord
      //permission since it's tied to one hardcoded user and one hardcoded guild,
      //not a role/permission bit or per-guild registration alone. The command is
      //never registered outside ADMIN_GUILD_ID (see registry.js/deploy-commands.js),
      //but this check is kept as a second, code-level line of defense.
      if (commandName === 'admin' && (interaction.user.id !== OWNER_ID || interaction.guildId !== ADMIN_GUILD_ID)) {
        return interaction.reply({ content: 'You have found the secret admin command. Unfortunately it is not available to you.', flags: MessageFlags.Ephemeral });
      }

      const Server = await Servers.findAll({
        where: {
          Server: interaction.guildId
        }
      });
      if (!Server[0]) {
        return interaction.reply({ content: 'This server hasn\'t been setup properly. Please kick the bot and re add it.', flags: MessageFlags.Ephemeral });
      }
      const modRole = Server[0].ManagerRole;
      const guildAuthor = interaction.member;

      if (command.modOnly && modRole != null && !guildAuthor.roles.cache.has(modRole)) {
        return interaction.reply({ content: 'This command can only be used by a moderator', flags: MessageFlags.Ephemeral });
      }

      //Cooldowns
      if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Collection());
      }

      const now = Date.now();
      const timestamps = cooldowns.get(command.name);
      const cooldownAmount = (command.cooldown || 3) * 1000;
      const isMod = guildAuthor.roles.cache.has(modRole);
      //if cooldown is running and author is not mod
      if (timestamps.has(interaction.user.id) && !isMod) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return interaction.reply({ content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`, flags: MessageFlags.Ephemeral });
        }
      }
      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      //excecute command
      try {
        await command.execute(interaction, isMod);
      } catch (err) {
        console.log(err);
        const payload = { content: 'There was an error trying to execute that command!', flags: MessageFlags.Ephemeral };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(payload);
        } else {
          await interaction.reply(payload);
        }
      }
    });
  });
});
