const fs = require('fs');
const http = require('http');
const url = require('url');
const path = require('path');


//discord setup
require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const cooldowns = new Discord.Collection();
const TOKEN = process.env.TOKEN;
const DMNGRID = process.env.DMNGRID;
const prefix = process.env.PREFIX + ' ';
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	bot.commands.set(command.name, command);
}


//discord login
bot.login(TOKEN);
bot.on('ready', () => {
	bot.user.setPresence({game: {name: '= suggest'}});
		console.info(`Logged into discord as ${bot.user.tag}!`);
    //const defaultChannel = bot.channels.get(process.env.DEFAULT);
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
  if (!cooldowns.has(command.name)) {
	   cooldowns.set(command.name, new Discord.Collection());
   }

   const now = Date.now();
   const timestamps = cooldowns.get(command.name);
   const cooldownAmount = (command.cooldown || 3) * 1000;

   if (timestamps.has(msg.author.id) && msg.author.id != DMNGRID) {
	    const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

	     if (now < expirationTime) {
		       const timeLeft = (expirationTime - now) / 1000;
		       return msg.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
	     }
   }
   timestamps.set(msg.author.id, now);
   setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);

   //executing command
	 if (command.guildOnly && msg.channel.type !== 'text') {
	 	return msg.reply('I can\'t execute that command inside DMs!');
	 }
	 if(command.modOnly && msg.author.id != DMNGRID){
		 return msg.reply('This command can only be used by a moderator');
	 }
   try {
     command.execute(msg, args);
   } catch (error) {
     console.error(error);
     msg.reply('There was an error trying to execute that command!');
   }
});
