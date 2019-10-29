var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

//= getting data from upload database
var files = require('../models/uploads');

//= database instance and gfs config
var gfs;
const conn = mongoose.connection;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
});

//= view all files by category
router.get('/', (req, res, next) => {

  const category = req.query.category || 'general';
  //= page starts with index 0
  const page = parseInt(req.query.page || '1');
  const limitPerPage = 5;

  files.find( {category : category})
    .limit(limitPerPage)
    .skip((page-1)*limitPerPage)
    .sort({_id: -1})
    .exec( (err,docs)=>{
  
      files.countDocuments({category : category}).exec( (err,count) => {

        if(err){
          return console.log(err); 

        }else if(count == 0){

          var response = { message : 'data not found'};
          return res.status(404).json(response);

        }else{

          var nextPage = page+1;
          var previousPage = page-1;
          const totalPages = Math.ceil(count/limitPerPage);

          if(page>totalPages) res.status(404).json({message : 'data not found'});
    
          if(page==1) previousPage = null;
          if(page==totalPages) nextPage = null; 
          
          let dataObtained = {
            files : docs,
            category: category,
            currentPage: page,
            totalPages : totalPages,
            totalFiles: count,
            nextPage: nextPage,
            previousPage: previousPage,
            page: `${category}`
          }

          res.render('files',dataObtained);
        }
      });
    });
});

//= view indiviual file
router.get('/viewFile', (req,res,next) => {

  //= file metadata id
  fileId = req.query.id;

  files.findById(fileId).exec( (err,file) => {

    if(!file) res.status(404).json({message : 'data not found'});

    res.render('view',{file,page: `${file.title}`});
  });

});

//= download file
router.get('/download', (req,res,next) => {

  //= file metadata id
  id = req.query.id;

  //= look for file data by id
  files.findById(id).exec( (err,data) => {

    if(!data) res.status(404).json({message : 'data not found'});

    gfs.collection('uploads');

    //= look for the file itself
    gfs.files.findOne({_id: data.fileId} , (err,file) => {
      
      //= get file extension
      const extension = '.'+file.filename.split('.').pop();
  
      //= set file type
      res.set('Content-Type', file.contentType);
      //= set filename
      res.attachment(data.title.trim()+extension);

      //= read file
      //! DeprecationWarning: GridStore is deprecated
      const readstream = gfs.createReadStream({
        _id: data.fileId,
      });

      readstream.on('error', function (err) {
        console.log('An error occurred! ', err);
      });

      //= download file
      readstream.pipe(res);
    }); 
  });
});

module.exports = router;
