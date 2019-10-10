const mongoose = require('mongoose');

const databaseName = 'Unexpo_repository';

const dbConnection = mongoose.connect(`mongodb://localhost:27017/${databaseName}`, 
{useNewUrlParser: true,useUnifiedTopology: true ,useCreateIndex: true});

module.exports.databaseName = databaseName;
module.exports.connect = dbConnection;