const DisToken =
const YTKey =
cont SpotifyID =
const SpotifySecret = 
const Sequelize = require('sequelize');
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
  BotEnv.sync().then(() => {
    BotEnv.create({
      ID: 1,
      DisToken: DisToken,
      YTKey: YTKey,
      SPotifyID: SpotifyID,
      SpotifySecret: SpotifySecret
    });
  });
