const Sequelize = require('sequelize');
require('dotenv').config();
const SQLUSERNAME = process.env.SQLUSERNAME;
const SQLPASSWORD = process.env.SQLPASSWORD;
const DisToken = process.env.DISTOKEN;
const Model = Sequelize.Model;
const sequelize = new Sequelize('jazzbot', SQLUSERNAME, SQLPASSWORD, {
  host: 'localhost',
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
    }
  }, {
    sequelize,
    modelName: 'BotEnv'
  });
  BotEnv.sync({force: true}).then(() => {
    BotEnv.create({
      ID: 1,
      DisToken: DisToken,
    });
  });
