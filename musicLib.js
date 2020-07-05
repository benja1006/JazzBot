const ytdl = require('ytdl-core-discord');
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
      .play(ytdl(song.url))
      .on("finish", () => {
        serverQueue.songs.shift();
        play(guild,serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
  }
}
