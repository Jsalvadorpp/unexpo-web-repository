var express = require('express');
var router = express.Router();
const ensureAuth = require('../config/ensureAuth');
const GridFsStorage = require('multer-gridfs-storage');
const multer = require('multer');
const database = require('../config/databaseConfig');

//= get upload page
router.get('/', ensureAuth, (req, res, next) => {

  const pageData = {
    page: 'Upload'
  };

  res.render('upload', pageData);

});

//= database instance
const connection = database.connect;

//= create storage engine to save files
//= information added to the file when uploading
const storage = new GridFsStorage({
  db: connection,
  file: (req, file) => {
    return {
      filename: file.originalname,
      metadata: {
        createdBy: req.user.username,
        something : req.body.category
      },
      bucketName: 'uploads'
    }
  }
});

//======================================================
//== reminder to myself : clean this code PLEASEEEEEE
//======================================================

//= function to validate data from upload form
const uploadValidation = (req,file,cb) => {
  
  var errors = [];
  
  if(typeof req.body.title === 'undefined' || req.body.title == '')  errors.push('title required');
  if(typeof req.body.description === 'undefined' || req.body.description == '')  errors.push('description required');

  //= check if there's errors
  if(errors.length > 0){

    errors.forEach( error => {
      req.flash('danger',error);
    });
    cb('fields required');

  }else{
    cb(null, true);
  }

};

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

    if(err) {
      
      if(err.message == 'File too large') req.flash('danger',err.message);
      res.redirect('upload');
    
    }else{

      if(typeof req.file === 'undefined'){

        req.flash('danger','file required');
        res.redirect('upload');

      }else{

        //= handle request and response
        const pageData = {
          page: 'Upload'
        };
        res.json({file: req.file});

      }
    }
  });

});

module.exports = router;
