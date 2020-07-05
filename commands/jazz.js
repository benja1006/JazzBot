const fs = require('fs');
const ytdl = require('ytdl-core');
const Youtube = require('../youtube');
const Spotify = require('../spotify');
const musicLib = require('../musicLib');
function shuffle(array){
  for (let i = array.length -1; i>0; i--){
    let j = Math.floor(Math.random() * (i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
module.exports = {
  name: 'jazz',
  description: 'Plays Jazz',
  aliases: ['Play'],
  usage: ['Jazz'],
  cooldown: 5,
  reqMusic: true,
  execute(msg, args, isMod) {
    var tokenArr = msg.client.tokenArr;
    let guildAuthor = msg.guild.members.cache.get(msg.author.id);
    //let guildAuthor = msg.member;
    console.log(guildAuthor);
    const serverQueue = msg.client.queue.get(msg.guild.id);
    //check if user is in a voice channel that supports music
    if(!guildAuthor.voice.channel){
      return msg.channel.send("You must be in a voice channel to use this command.");
    }
    const voiceChannel = guildAuthor.voice.channel;
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if(!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return msg.channel.send("I need permission to join and speak in the voice channel.");
    }
    //connect to database to get song url's
    const SQLUSERNAME = process.env.SQLUSERNAME;
    const SQLPASSWORD = process.env.SQLPASSWORD;
    const prefix = process.env.PREFIX + ' ';
    const Sequelize = require('sequelize');
    const sequelize = new Sequelize('jazzbot', SQLUSERNAME, SQLPASSWORD, {
      host: 'localhost',
      dialect: 'mysql'
    });
    const Model = Sequelize.Model;
    class Songs extends Model {}
    Songs.init({
      ID: {
        type: Sequelize.INTEGER(4),
        primaryKey: true,
        autoIncrement: true
      },
      SpotID: {
        type: Sequelize.STRING(23),
        autoIncrement: false
      },
      Include: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      YTID: {
        type: Sequelize.STRING(15),
        autoIncrement: false
      }
    }, {
      sequelize,
      modelName: 'Songs'
    });
    //check playlist to be played
    var playlistId;
    if(args.length == 0){
      playlistId = '272GBqcvfT6AtiKiakE2mG'
    }
    if(args.length == 1){
      playlistId = args[1];
    }
    if(args.length >= 1){
      return msg.reply('Please only insert a valid playlist Id');
    }
    if(!serverQueue){
      const queueContract = {
        textChannel: msg.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
      };
      msg.client.queue.set(msg.guild.id, queueContract);
      //get songs from database
      console.log('about to get songs.');
      Songs.sync({force: true}).then(() => {
        Spotify.getSongs(tokenArr, playlistId).then(async function(returnArr){
          console.log('getSongs has ran');

          let items = returnArr[1];
          console.log(items[0]);
          items = shuffle(items);
          console.log(items[0]);
          for(let i = 0; i < items.length; i++){
            /* for each item if the database has a link, procede with normal playback
            if the database has no link, look up the song with youtube
            */
            await Songs.findOne({
              where: {
                SpotID: items[i].track.id
              }
            }).then(async function(song) {
              if(!song){
                //lookup song on youtube
                let songResource = await Youtube.lookup(items[i].track.name, items[i].track.artists[0].name);//name, artist
                song = await Songs.create({
                  SpotID: items[i].track.id,
                  YTID: songResource.id.videoId
                });
              }

              let url = 'https://www.youtube.com/watch?v=' + song.YTID;
              //if the song shouldn't be included. Don't do anything else
              if(song.Include){
                //url of song has been found. It has also been added to database if not already there.
                const songInfo = await ytdl.getInfo(url);
                const song = {
                  title: songInfo.videoDetails.title,
                  url: songInfo.videoDetails.video_url
                };
                queueContract.songs.push(song);
                try{
                  var connection = await voiceChannel.join();
                  queueContract.connection = connection;
                  musicLib.play(msg.guild, queueContract.songs[0]);
                } catch (err) {
                  console.log(err);
                  msg.client.queue.delete(msg.guild.id);
                  return msg.channel.send(err);
                }
              }
            });
          }
        });
      });
    }
  },
};
