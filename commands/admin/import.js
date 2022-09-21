const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  name: 'import',
  description: 'Imports data to the mysql server',
  aliases: [''],
  usage: ['/import dataset'],
  data: new SlashCommandBuilder()
    .setName('import')
    .setDescription('import mysql data from file')
    .addStringOption(option =>
      option.setName('database')
      .setDescription('The database to import from')
      .setRequired(true)
      .setChoices(
        {name: 'Servers', value: 'servers'}
      )),
  execute(msg, args) {
    if(args.length >= 1){
      let type = args.shift();
      const https = require('https');
      const fs = require('fs');
      const parse = require('csv-parse')
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
      switch(type){
        case "servers":
          Servers.sync().then(
            Servers.findAll().then(Serverlist => {
              if(msg.attachments.size > 0){
                fileURL = msg.attachments.first().attachment
                const serverArr = []
                const file = fs.createWriteStream("./exportFiles/servers.csv")
                const request = https.get(fileURL, (res) => {
                  res.pipe(file);
                  let tempArr = []
                  res.on('data', (data) => {
                    parse(data, {columns: ['Server', 'General', 'Suggest', 'ManagerRole']}, (err, rows) => {
                      for(row in rows){
                        serverArr.push(row)
                      }
                    });
                  })
                  file.on('finish', () =>{
                    file.close()
                    //serverArr is now ready
                    console.log(serverArr)
                      for(let item in serverArr){
                        alreadyExists = false
                        for(Server in Serverlist){
                          if(item['Server'] == Server.Server){
                            console.log(item['Server'])
                            console.log(Server.Server)
                            alreadyExists = true
                            break
                          }
                        }
                        if(!alreadyExists){
                          console.log('Adding server: ' + item['Server'])
                          Servers.create({
                            Server: item['Server'],
                            General: item['General'],
                            Suggest: item['Suggest'],
                            ManagerRole: item['ManagerRole']
                          })
                        }
                      }
                  })
                })
              }

            })
          )
      }
    }

  },
}
