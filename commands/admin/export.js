module.exports = {
  name: 'export',
  description: 'Exports data from the mysql server',
  aliases: [''],
  usage: ['export dataset'],
  execute(msg, args) {
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
          Servers.findAll().then(Server => {
            for (Server in Servers){
              msg.channel.send(Server.ID + ", " + Server.Server + ", " + Server.General + ", " + Server.Suggest + ", " + Server.ManagerRole);
            }
          })
        )
    }
  },
}
