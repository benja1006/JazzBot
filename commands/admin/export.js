module.exports = {
  name: 'export',
  description: 'Exports data from the mysql server',
  aliases: [''],
  usage: ['export dataset'],
  reqMusic: false,
  execute(msg, args) {
    let type = args[0];
    let output = [];
    switch(type){
      case 'songs':
      case 'song':
        //connect to database to get song url's
        const SQLUSERNAME = process.env.SQLUSERNAME;
        const SQLPASSWORD = process.env.SQLPASSWORD;
        const prefix = process.env.PREFIX + ' ';
        const Sequelize = require('sequelize');
        const sequelize = new Sequelize('jazzbot', SQLUSERNAME, SQLPASSWORD, {
          host: 'mysql',
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
        Songs.sync().then(() => {
          Songs.findAll({
            attributes: ['SpotID', 'Include', 'YTID']
          }).then(songs => {
            for(i=0; i<songs.length; i++){
              output.push(songs[i].SpotID + ',' + songs[i].Include + ',' + songs[i].YTID);
              if(i % 40 == 0){
                msg.channel.send(output, {split: true});
                output = [];
              }
            }
            msg.channel.send(output, {split: true});
          });
        });
        break;
    }
  },
}
