const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
    username: {type: String,required: true,unique: true},
    email: {type: String,required: true},
    googleId: {type: String,required: true},
    role: {type: String, default: 'user'}
});

const User = module.exports = mongoose.model('User',UserSchema)