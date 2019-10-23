var express = require('express');
var router = express.Router();
const ensureAuth = require('../config/ensureAuth');
const GridFsStorage = require('multer-gridfs-storage');
const multer = require('multer');
const database = require('../config/databaseConfig');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

//= getting data from upload database
var uploads = require('../models/uploads');

//= get upload page
router.get('/', ensureAuth, (req, res, next) => {

  const pageData = {
    page: 'Upload'
  };

  res.render('upload', pageData);
});

//= database instance and gfs config
var gfs;
const connection = database.connect;
const conn = mongoose.connection;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
});

//= create storage engine to save files
//= information added to the file when uploading
const storage = new GridFsStorage({
  db: connection,
  file: (req, file) => {
    return {
      filename: file.originalname,
      bucketName: 'uploads'
    }
  }
});

//= function to validate data from upload form
const uploadValidation = (req,file,cb) => {
  
  var errors = [];

  //= check form inputs
  if(typeof req.body.title === 'undefined' || req.body.title == '')  errors.push('title required');
  if(typeof req.body.description === 'undefined' || req.body.description == '')  errors.push('description required');

  //= check if there's errors
  if(errors.length > 0){

    errors.forEach( error => {
      req.flash('danger',error);
    });
    cb('error uploading');

  }else{

    //= check if the title is already saved in Db
    uploads.findOne( {title: req.body.title}, (err,file) => {
      if(file){
        req.flash('danger','use another title');
        cb('error uploading');
      }else{
        //= upload file 
        cb(null, true);
      }
    });
  }
};

//= upload config using multer
const megabyte = 1024*1024;
const upload = multer({ 
  storage , 
  fileFilter: uploadValidation , 
  limits: {fileSize: 100*megabyte} 
}).single('file');

//= getting data from upload form
router.post('/', (req,res) => {

  //= trying to upload the file
  upload(req,res,(err) => {

    //= file not uploaded 
    if(err) {
      
      if(err.message == 'File too large') req.flash('danger',err.message);
      res.redirect('upload');
    
    //= file uploaded
    }else{

      //= if no file was submitted then return to upload page
      if(typeof req.file === 'undefined'){

        req.flash('danger','file required');
        res.redirect('upload');
      
      //= trying to create file data 
      }else{
        //= check if there's a file with same size and mimetype in DB
        uploads.findOne({size: req.file.size,mimetype: req.file.mimetype},(err,file) => {
          //= if there's a file then delete the file that was uploaded and return the upload page
          if(file){

            req.flash('danger','file is already into database , please upload another file');
            //= remove duplicate file
            gfs.remove({_id: req.file.id , root: 'uploads'});
            res.redirect('upload');

          //= if there's no duplicate file then insert file data into Db
          }else{
            //= insert file data into database (file not included - the file saves in uploads.files)
            const file = new uploads({
            createdBy: req.user.username,
            title: req.body.title,
            filename: req.file.filename,
            description: req.body.description,
            category: req.body.category,
            size: req.file.size,
            mimetype: req.file.mimetype,
            fileId: req.file.id
            });

            //= save file data
            file.save( (err,savedFile) => {
              if (err)  return console.error(err);
            });
            
            req.flash('success','file uploaded!');
            res.render('homepage',{page: 'home'});
          }
        });
      }
    }
  });
});

module.exports = router;