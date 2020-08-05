module.exports = {
  name: 'import',
  description: 'Imports data to the mysql server',
  aliases: [''],
  usage: ['import dataset'],
  reqMusic: false,
  execute(msg, args) {
    if(args.length > 1 && args.length < 3){
      let type = args.shift();
      let input = args;
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
            input = input[0].split('\n');
            for(let i = 0; i<input.length; i++){
              let item = input[i].split(',');
              Songs.create({
                SpotID: item[0],
                Include: item[1],
                YTID: item[2]
              });
            }
          });
          break;
      }
    }

  },
}
