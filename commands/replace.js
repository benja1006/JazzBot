module.exports = {
  name: 'replace',
  description: 'Replaces the song with a new version',
  usage: [''],
  cooldown: 10,
  reqMusic: true,
  execute(msg, args, isMod) {
    var tokenArr = msg.client.tokenArr;
    const serverQueue = msg.client.queue.get(msg.guild.id);
    if(!msg.member.voice.channel){
      return msg.channel.send("You have to be in a voice channel to replace the song!");
    }
    if(!serverQueue){
      return msg.channel.send("There is no song playing to replace");
    }
    if(args.length != 1){
      return msg.channel.send("Please include one youtube link to replace the song with.");
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
    let newId = args[0].slice(32);
    Songs.sync().then(() => {
      Songs.find({
        where: {
          YTID: id
        }
      }).then(song => {
        song.update({
          YTID: newId
        });
      });
    });
    serverQueue.connection.dispatcher.end();
  },
}
