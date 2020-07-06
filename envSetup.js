const DisToken = 'NzEyMjU0NjYzMDI1NDkxOTk5.XwKm9Q.itJvskaCmdxi8K5UTLYejb-tTiM';
const YTKey = 'AIzaSyAT6lqWE6_W5Zu25IbwZLPVVsNg1qyQQ7w';
const SpotifyID = '53b1db6aceab4b3d875fafbe5208ff8d';
const SpotifySecret = 'd0e0936b369a40ff8fe4fa839abf4291';
const Sequelize = require('sequelize');
require('dotenv').config();
const SQLUSERNAME = process.env.SQLUSERNAME;
const SQLPASSWORD = process.env.SQLPASSWORD;
const Model = Sequelize.Model;
const sequelize = new Sequelize('jazzbot', SQLUSERNAME, SQLPASSWORD, {
  host: 'mysql',
  dialect: 'mysql'
});
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
  class BotEnv extends Model {}
  BotEnv.init({
    ID: {
      type: Sequelize.INTEGER(4),
      primaryKey: true,
      autoIncrement: true
    },
    DisToken: {
      type: Sequelize.STRING(59),
      autoIncrement: false
    },
    YTKey: {
      type: Sequelize.STRING(59),
      autoIncrement: false
    },
    SpotifyID: {
      type: Sequelize.STRING(59),
      autoIncrement: false
    },
    SpotifySecret: {
      type: Sequelize.STRING(59),
      autoIncrement: false
    },
  }, {
    sequelize,
    modelName: 'BotEnv'
  });
  BotEnv.sync({force: true}).then(() => {
    BotEnv.create({
      ID: 1,
      DisToken: DisToken,
      YTKey: YTKey,
      SpotifyID: SpotifyID,
      SpotifySecret: SpotifySecret
    });
  });
