module.exports = {
  name: 'import',
  description: 'Imports data to the mysql server',
  aliases: [''],
  usage: ['import dataset'],
  execute(msg, args) {
    if(args.length > 1 && args.length < 3){
      let type = args.shift();
      let input = args;
      const Sequelize = require('sequelize');
      const SQLUSERNAME = process.env.SQLUSERNAME;
      const SQLPASSWORD = process.env.SQLPASSWORD;
      const Model = Sequelize.Model;
      const sequelize = new Sequelize('jazzbot', SQLUSERNAME, SQLPASSWORD, {
        host: 'mysql',
        dialect: 'mysql'
      });
      class Servers extends Model {}
      Servers.init({
        ID: {
          type: Sequelize.INTEGER(4),
          primaryKey: true,
          autoIncrement: true
        },
        Server: {
          type: Sequelize.BIGINT(18),
          autoIncrement: false
        },
        General: {
          type: Sequelize.BIGINT(18),
          autoIncrement: false
        },
        Suggest: {
          type: Sequelize.BIGINT(18),
          autoIncrement: false
        },
        ManagerRole: {
          type: Sequelize.BIGINT(18),
          autoIncrement: false
        }
      }, {
        sequelize,
        modelName: 'Servers'
      });
      let type = args[0].toLowerCase();
      let output = [];
      switch(type){
        case "servers":
          Servers.sync().then(
    }

  },
}
