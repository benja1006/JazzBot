module.exports = {
  name: 'stop',
  description: 'Stops the music',
  usage: [''],
  cooldown: 10,
  execute(msg, args, extra, Env) {
    var tokenArr = extra[0];
    const serverQueue = extra[1];
    if(!message.member.voice.channel){
      return msg.channel.send("You have to be in a voice channel to stop the song!");
    }
    if(!serverQueue){
      return message.channel.send("There is no song playing to stop");
    }
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    return serverQueue;
  },
}
