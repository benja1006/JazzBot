// Single source of truth for slash-command schemas (name, description, options).
// Imported by both deploy-commands.js and index.js's guildCreate handler so
// registration never drifts from what's actually deployed. Changing a
// command's name/description/options here requires re-running
// deploy-commands.js against already-joined guilds — a command file's
// reload.js only hot-swaps its execute logic, it cannot push schema changes.
//
// `publicCommands` is registered automatically to every guild on guildCreate.
// `adminCommand` is registered only to ADMIN_GUILD_ID (see deploy-commands.js)
// — it's never included in guildCreate's auto-registration, so it's never
// present on any guild but the one it's deliberately deployed to.
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

const publicCommands = [
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('List all of my commands or info about a specific command')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('Name of a command to get info about')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Setup JazzBot on your server')
    .addSubcommand(sub =>
      sub.setName('mod')
        .setDescription('Set the role that has moderator privileges on the bot')
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('Role to grant moderator privileges')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('general')
        .setDescription('Set the general channel')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Channel to use as general (defaults to the current channel)')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('suggestion')
        .setDescription('Set the channel suggestions are forwarded to')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Channel to use for suggestions (defaults to the current channel)')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false))),

  new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Suggest something to the moderators')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Your suggestion')
        .setRequired(true)),
];

const adminCommand = new SlashCommandBuilder()
  .setName('admin')
  .setDescription('Admin-only commands for JazzBot')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand(sub =>
    sub.setName('help')
      .setDescription('List all admin commands or info about a specific one')
      .addStringOption(option =>
        option.setName('command')
          .setDescription('Name of an admin command to get info about')
          .setRequired(false)))
  .addSubcommand(sub =>
    sub.setName('reload')
      .setDescription('Reloads a command\'s logic without restarting the bot')
      .addStringOption(option =>
        option.setName('command')
          .setDescription('Name of the command to reload')
          .setRequired(true)));

module.exports = { publicCommands, adminCommand };
