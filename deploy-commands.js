// Standalone script — not required by index.js. Run manually to (re)register
// slash commands for a guild the bot is already in:
//   node deploy-commands.js <guildId>
// or set GUILD_ID in the environment instead of passing an argument.
//
// New guilds get the public commands automatically via index.js's guildCreate
// handler; this script is only needed to backfill existing guilds, or after a
// command's name/description/options change in commands/registry.js (reload
// only hot-swaps a command's execute logic, it can't push schema changes).
//
// The admin command is deliberately excluded from guildCreate's
// auto-registration — it's only ever registered here, and only for the guild
// matching ADMIN_GUILD_ID in the environment, so it never ends up registered
// on any guild but the intended one.
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const Sequelize = require('sequelize');
const { publicCommands, adminCommand } = require('./commands/registry.js');

const guildId = process.argv[2] || process.env.GUILD_ID;
if (!guildId) {
  console.error('Usage: node deploy-commands.js <guildId>  (or set GUILD_ID in the environment)');
  process.exit(1);
}

const commands = guildId === process.env.ADMIN_GUILD_ID
  ? [...publicCommands, adminCommand]
  : publicCommands;

const SQLUSERNAME = process.env.SQLUSERNAME;
const SQLPASSWORD = process.env.SQLPASSWORD;
const sequelize = new Sequelize('jazzbot', SQLUSERNAME, SQLPASSWORD, {
  host: 'mysql',
  dialect: 'mysql'
});
const Model = Sequelize.Model;
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

(async () => {
  const env = await BotEnv.findOne({ where: { ID: 1 } });
  if (!env) {
    throw new Error('No BotEnv row found (ID 1) — run envSetup.js first.');
  }

  const rest = new REST().setToken(env.DisToken);
  const { id: applicationId } = await rest.get(Routes.oauth2CurrentApplication());
  const body = commands.map(command => command.toJSON());
  await rest.put(Routes.applicationGuildCommands(applicationId, guildId), { body });

  console.log(`Registered ${commands.length} commands for guild ${guildId}.`);
  await sequelize.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
