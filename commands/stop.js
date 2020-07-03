module.exports = {
  name: 'stop',
  description: 'Stops the music',
  usage: [''],
  cooldown: 10,
  execute(msg, args, isMod) {
    var tokenArr = msg.client.tokenArr;
    const serverQueue = msg.client.queue.get(msg.guild.id);
    if(!message.member.voice.channel){
      return msg.channel.send("You have to be in a voice channel to stop the song!");
    }
    if(!serverQueue){
      return message.channel.send("There is no song playing to stop");
    }
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  },
}
