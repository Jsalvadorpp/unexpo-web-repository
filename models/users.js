const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
    username: {type: String,required: true,unique: true},
    email:{type: String,required: true},
    password:{type: String,required: true}
});

const User = module.exports = mongoose.model('User',UserSchema)