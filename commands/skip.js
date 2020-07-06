module.exports = {
  name: 'skip',
  description: 'Skips the current song on the playlist',
  usage: [''],
  cooldown: 2,
  reqMusic: true,
  execute(msg, args, isMod) {
    var tokenArr = msg.client.tokenArr;
    const serverQueue = msg.client.queue.get(msg.guild.id);
    if(!msg.member.voice.channel){
      return msg.channel.send("You have to be in a voice channel to skip the song!");
    }
    if(!serverQueue){
      return msg.channel.send("There is no song playing to skip");
    }
    serverQueue.connection.dispatcher.end();
  },
}
