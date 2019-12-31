const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

// upload Schema
const UploadSchema = new Schema({
    createdBy: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    userId: {
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
    mention: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    fileType: {
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
    tags:{
        type: [String],
        default: null
    },
    fileId: {
        type: ObjectId,
        required: true
    },
    uploadDate: {
        type: Date,
        require: true,
        default: Date.now
    }
});

const Upload = module.exports = mongoose.model('Upload',UploadSchema);