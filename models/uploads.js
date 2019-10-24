const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

// upload Schema
const UploadSchema = new Schema({
    createdBy: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    mimetype:{
        type: String,
        required: true
    },
    md5:{
        type: String,
        required: true
    },
    fileId: {
        type: ObjectId,
        required: true
    }
});

const Upload = module.exports = mongoose.model('Upload',UploadSchema);