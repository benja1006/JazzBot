module.exports = {
  name: 'stop',
  description: 'Stops the music',
  usage: [''],
  cooldown: 10,
  reqMusic: true,
  execute(msg, args, isMod) {
    var tokenArr = msg.client.tokenArr;
    const serverQueue = msg.client.queue.get(msg.guild.id);
    if(!msg.member.voice.channel){
      return msg.channel.send("You have to be in a voice channel to stop the song!");
    }
    if(!serverQueue || !serverQueue.connection){
      return msg.channel.send("There is no song playing to stop");
    }
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  },
};
