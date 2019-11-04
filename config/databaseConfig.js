const mongoose = require('mongoose');
require('dotenv').config()

const databaseName = 'Unexpo_repository';

const dbConnection = mongoose.connect(process.env.MONGODB_URI, 
{useNewUrlParser: true,useUnifiedTopology: true ,useCreateIndex: true})

dbConnection.then( () => {
    console.log('connected to mongo');
});

module.exports.databaseName = databaseName;
module.exports.connect = dbConnection;