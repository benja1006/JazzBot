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
    let guildAuthor = msg.member;
    //let guildAuthor = msg.member;
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
    msg.channel.send('Starting the Music');
    //connect to database to get song url's
    const SQLUSERNAME = process.env.SQLUSERNAME;
    const SQLPASSWORD = process.env.SQLPASSWORD;
    const prefix = process.env.PREFIX + ' ';
    const Sequelize = require('sequelize');
    const sequelize = new Sequelize('jazzbot', SQLUSERNAME, SQLPASSWORD, {
      host: 'mysql',
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
        volume: 2,
        playing: true,
      };
      msg.client.queue.set(msg.guild.id, queueContract);
      //get songs from database
      console.log('about to get songs.');
      Songs.sync().then(() => {
        Spotify.getSongs(tokenArr, playlistId).then(async function(returnArr){
          console.log('getSongs has ran');

          let items = returnArr[1];
          items = shuffle(items);
          let i = 0;
          async function songLoop(){
            /* for each item if the database has a link, procede with normal playback
            if the database has no link, look up the song with youtube
            */
            let didYTLookup = false;
            await Songs.findOne({
              where: {
                SpotID: items[i].track.id
              }
            }).then(async function(songObj) {
              if(!songObj){
                didYTLookup = true;
                //lookup song on youtube
                let songResource = await Youtube.lookup(items[i].track.name, items[i].track.artists[0].name, msg).catch(err => {
                  Songs.destroy({
                    where: {
                      SpotID: items[i].track.id
                    }
                  }).then(() => {
                    i++;
                    if(i<items.length){
                      return songLoop();
                    }
                  });
                });//name, artist
                if(!songResource) return msg.channel.send('The youtube data cap has been hit. More songs can be added tomorrow.');
                songObj = await Songs.create({
                  SpotID: items[i].track.id,
                  YTID: songResource.id.videoId
                });
              }

              let url = 'https://www.youtube.com/watch?v=' + songObj.YTID;
              //if the song shouldn't be included. Don't do anything else
              if(songObj.Include){
                //url of song has been found. It has also been added to database if not already there.
                const songInfo = await ytdl.getInfo(url).catch(err => {
                    i++
                    if(i<items.length){
                      return songLoop();
                    }
                    else{
                      return
                    }
                });
                if(!songInfo){
                  i++
                  if(i<items.length){
                    return songLoop();
                  }
                  else{
                    return
                  }
                }
                const song = {
                  title: songInfo.playerResponse.videoDetails.title,
                  url: url
                };
                console.log('i is ' + i);
                if(i == 0){
                  try{
                    queueContract.songs.push(song);
                  }
                  catch (err){
                    return console.log('Queue was deleted');
                  }
                  try{
                    console.log('trying');
                    var connection = await voiceChannel.join();
                    queueContract.connection = connection;
                    musicLib.play(msg.guild, queueContract.songs[0]);
                  } catch (err) {
                    console.log(err);
                    msg.client.queue.delete(msg.guild.id);
                    return msg.channel.send(err);
                  }
                }
                else{
                  try{
                    msg.client.queue.get(msg.guild.id).songs.push(song);
                  } catch(err){
                    return console.log('Queue was deleted');
                  }

                  //console.log(msg.client.queue.get(msg.guild.id).songs);
                }
              }

            });
            i++;

            if(i<items.length && msg.client.queue.get(msg.guild.id)){
              if(didYTLookup){
                setTimeout(songLoop, 100);
              }
              else{
                songLoop();
              }
            }
          }
          songLoop();
        });
      });
    }
  },
};
