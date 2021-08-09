let fs = require('fs')
module.exports = {
  name: 'export',
  description: 'Exports data from the mysql server',
  aliases: [''],
  usage: ['export dataset'],
  execute(msg, args) {
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
    switch(type){
      case "servers":
        Servers.sync().then(
          Servers.findAll().then(async Serverlist => {
            //console.log(Serverlist)
            let filedata = []
            for (i in Serverlist){
              Server = Serverlist[i]
              data = Server.Server + "," + Server.General + "," + Server.Suggest + "," + Server.ManagerRole;
              filedata.push(data)
            }
            await fs.writeFile('./exportFiles/servers.csv', filedata.join('\n'), (err) => {
              console.log(Server.Server)
            });
            msg.reply({ files: ['./exportFiles/servers.csv'], ethereal: true});
          })
        )
    }
  },
}
