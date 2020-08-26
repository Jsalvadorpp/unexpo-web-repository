const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Reports Schema
const ReportSchema = new Schema({
    fileId:{ 
        type: String
    },
    userId: {
        type: String
    }
});

const Report = module.exports = mongoose.model('Report',ReportSchema);