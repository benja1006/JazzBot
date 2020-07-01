module.exports = {
  name: 'skip',
  description: 'Skips the current song on the playlist',
  usage: [''],
  cooldown: 2,
  execute(msg, args, extra, Env) {
    var tokenArr = extra[0];
    const serverQueue = extra[1];
    if(!message.member.voice.channel){
      return msg.channel.send("You have to be in a voice channel to skip the song!");
    }
    if(!serverQueue){
      return message.channel.send("There is no song playing to skip");
    }
    serverQueue.connection.dispatcher.end();
    return serverQueue;
  },
}
