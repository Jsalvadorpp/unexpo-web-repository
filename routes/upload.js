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

//= getting tags from database
var tagList = require('../models/tags');

//= get upload page
router.get('/', ensureAuth, (req, res, next) => {

  const pageData = {
    page: 'Subir Archivo'
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
  if(typeof req.body.title === 'undefined' || req.body.title == '')  errors.push('Se necesita el titulo');
  if(typeof req.body.description === 'undefined' || req.body.description == '')  errors.push('se necesita la descripcion');
  if(typeof req.body.author === 'undefined' || req.body.author == '') errors.push('el autor es necesario');

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
        req.flash('danger','usa otro titulo');
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
      
      if(err.message == 'File too large') req.flash('danger','archivo demasiado pesado');
      res.redirect('upload');
    
    //= file uploaded
    }else{

      //= if no file was submitted then return to upload page
      if(typeof req.file === 'undefined'){

        req.flash('danger','se necesita del archivo');
        res.redirect('upload');
      
      //= trying to create file data 
      }else{
        //= check if there's a file with same size, mimetype and md5 in DB
        uploads.findOne({size: req.file.size,mimetype: req.file.mimetype, md5: req.file.md5},(err,file) => {
          //= if there's a file then delete the file that was uploaded and return the upload page
          if(file){

            req.flash('danger','el archivo ya se encuentra en la base de datos , porfavor use otro');
            //= remove duplicate file
            gfs.remove({_id: req.file.id , root: 'uploads'});
            res.redirect('upload');

          //= if there's no duplicate file then insert file data into Db
          }else{
            //= insert file data into database (file not included - the file saves in uploads.files)

            //= get file extension
            const extension = req.file.filename.split('.').pop();
            let fileType = getFileType(extension);
            let btnClass = getFileTypeClass(extension).btnClass;
            let btnName = getFileTypeClass(extension).btnName; 

            //= add new tags in to the database
            let tags = (req.body.tags == '')? null : (req.body.tags).split(',');
            if(tags !== null) addTags(tags);

            //= publication date
            let publicationDate = req.body.publicationDate;
            if(typeof req.body.publicationDate === 'undefined' || req.body.publicationDate== '') publicationDate = 'desconocido';
            
            const file = new uploads({
              createdBy: req.user.username,
              userId: req.user.googleId,
              title: req.body.title,
              filename: req.file.filename,
              description: req.body.description,
              mention: req.body.mention,
              semester: req.body.semester,
              fileType,
              author: req.body.author,
              size: req.file.size,
              mimetype: req.file.mimetype,
              md5: req.file.md5,
              tags: tags,
              fileId: req.file.id,
              publicationDate: publicationDate,
              elementClass:{
                btnClass,
                btnName
              }
            });

            //= save file data
            file.save( (err,savedFile) => {
              if (err)  return console.error(err);
            });
            
            req.flash('success','archivo subido');
            res.render('homepage',{page: 'home'});
          }
        });
      }
    }
  });
});

function getFileType(ext){

  if(ext.match(/(avi|mpg|mkv|mov|mp4|3gp|webm|wmv)$/i)) return 'video';
  if(ext.match(/(doc|docx|xls|xlsx|ppt|pptx|txt|pdf)$/i)) return 'document';
  if(ext.match(/(jpg|png|gif|jpeg)$/i)) return 'image';
  if(ext.match(/(zip|rar|tar|gzip|gz|exe)$/i)) return 'aplication';

  //= in case there's not match
  return 'other';
}

function getFileTypeClass(ext){

  if(ext.match(/(jpg|png|gif|jpeg)$/i)) return {btnClass:'fileType-img', btnName:'Imagen'};
  if(ext.match(/(pdf)$/i)) return {btnClass:'fileType-pdf', btnName: 'PDF'};
  if(ext.match(/(doc|docx)$/i)) return {btnClass:'fileType-word', btnName:'Word'};
  if(ext.match(/(zip|rar|tar|gzip|gz|exe)$/i)) return {btnClass:'fileType-application',btnName:'Aplicacion'};
  if(ext.match(/(ppt|pptx)$/i)) return {btnClass: 'fileType-powerpoint', btnName: 'PowerPoint'};

  //= in case there's not match
  return {btnClass:'fileType-other',btnName:'Otros'};
}

//= add tags to the database function
function addTags(tags){

  tags.forEach( tag => {

    const newTag = new tagList({
      name: tag
    });

    tagList.findOne({name: tag},(err,doc)=>{
      if(!doc){
        newTag.save( (err,saveTag)=> {if(err) console.log(err)});
      }
    });
  });
}

module.exports = router;
