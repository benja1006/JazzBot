module.exports = {
  name: 'skip',
  description: 'Skips the current song on the playlist',
  usage: [''],
  cooldown: 2,
  execute(msg, args, isMod) {
    var tokenArr = msg.client.tokenArr;
    const serverQueue = msg.client.queue.get(msg.guild.id);
    if(!message.member.voice.channel){
      return msg.channel.send("You have to be in a voice channel to skip the song!");
    }
    if(!serverQueue){
      return message.channel.send("There is no song playing to skip");
    }
    serverQueue.connection.dispatcher.end();
  },
}
