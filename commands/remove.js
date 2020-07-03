module.exports = {
  name: 'remove',
  description: 'Removes the song from the list',
  usage: [''],
  cooldown: 10,
  execute(msg, args, isMod) {
    var tokenArr = msg.client.tokenArr;
    const serverQueue = msg.client.queue.get(msg.guild.id);
    if(!message.member.voice.channel){
      return msg.channel.send("You have to be in a voice channel to remove the song!");
    }
    if(!serverQueue){
      return message.channel.send("There is no song playing to remove");
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
    let currSong = serverQueue.songs[0];
    let id = currSong.url.slice(32);
    Songs.sync().then(() => {
      Songs.find({
        where: {
          YTID: id
        }
      }).then(song => {
        song.update({
          Include: false
        });
      });
    });
    serverQueue.connection.dispatcher.end();
  },
}
