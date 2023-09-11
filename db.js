/**
 * Database and create a localhost
 */

const {MongoClient} = require('mongodb'),
dotenv = require('dotenv');
dotenv.config()

const client = new MongoClient(process.env.CONNECTIONSTRING),
port = process.env.PORT;

async function start() {
  await client.connect()
  module.exports = client
  const app = require('./app')
  app.listen(port, () => console.log(`Listening on port ${port}`));
}

start()
