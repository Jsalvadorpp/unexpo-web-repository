const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Filters Schema
const FilterSchema = new Schema({
    name: {
        type: String
    },
    type: {
        type: String
    }
});

const Filter = module.exports = mongoose.model('Filter',FilterSchema);