const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
    username: {type: String,required: true,unique: true},
    email: {type: String,required: true},
    googleId: {type: String,required: true},
    role: {type: String, default: 'user'},
    /** last moments changes .... */
    profileRole: {type: String },
    contact: {type: String},
    name: {type: String},
    description: {type: String}
});

const User = module.exports = mongoose.model('User',UserSchema)