const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// tags Schema
const TagSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    }
});

const Tag = module.exports = mongoose.model('Tag',TagSchema);