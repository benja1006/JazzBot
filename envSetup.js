// Manual, one-time setup script. Run via `node envSetup.js` with a real
// .env file present (DIS_TOKEN, SQLUSERNAME, SQLPASSWORD).
const Sequelize = require('sequelize');
require('dotenv').config();
const DisToken = process.env.DIS_TOKEN;
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
      type: Sequelize.STRING(128),
      autoIncrement: false
    }
  }, {
    sequelize,
    modelName: 'BotEnv'
  });
  BotEnv.sync({force: true}).then(() => {
    BotEnv.create({
      ID: 1,
      DisToken: DisToken
    });
  });
