const ytdl = require('ytdl-core');
module.exports = {
  play: function(guild, song) {
    const queue = guild.client.queue;
    const serverQueue = guild.client.queue.get(guild.id);
    if(!song){
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }

    const dispatcher = serverQueue.connection
      .play(ytdl(song.url, {quality: 140}))
      .on("finish", () => {
        serverQueue.songs.shift();
        module.exports.play(guild,serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
  }
}
