var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const { check, validationResult } = require('express-validator');
const userAuth = require('../config/userAuth');
const limitPerPage = 5;

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
  const searchOption = { category };
  
  files.countDocuments(searchOption,(err,count) => {
    files.find(searchOption)
    .limit(limitPerPage)
    .skip((page-1)*limitPerPage)
    .sort({_id: -1})
    .exec( (err,docs)=>{

      const searchData = {
        page,
        count,
        category,
        query: null,
        err,
        docs
      }

      pagination(req,res,searchData);
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

//= view all files using the search box
router.get('/search',(req,res) => {

  const page = parseInt(req.query.page || '1');
  const query = req.query.q;
  var regex = new RegExp(query, "i");

  const searchOptions = {
    $or: [
      {title: {$regex: regex}},
      {description: {$regex: regex}}
    ]
  };

  files.countDocuments(searchOptions, (err,count) => {
    files.find(searchOptions)
    .limit(limitPerPage)
    .skip((page-1)*limitPerPage)
    .sort({_id: -1})
    .exec( (err,docs)=>{

      const searchData = {
        page,
        count,
        category: null,
        query,
        err,
        docs
      }

      pagination(req,res,searchData);
    });
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

//= edit page 
router.get('/edit', userAuth , (req,res) => {

  const id = req.query.id;

  files.findById(id).exec( (err,file) => {
    if(!file) return res.status(404).json({message : 'data not found'});

    res.render('edit',{file,page: `${file.title}`});
  });
});

//= update file data
router.put('/edit', userAuth ,[
  //= check user input
  check('title')
    .not().isEmpty().withMessage('title is required'),
  check('description')
    .not().isEmpty().withMessage('description is required')
  ],
  //= handle request and response
  (req,res) => {

    const id = req.query.id;
    const updatedData = {
      title : req.body.title,
      description : req.body.description,
      category : req.body.category
    };

    const errors = validationResult(req);
    //= check errors
    if (!errors.isEmpty()) {

      errors.array().forEach( error => {
        req.flash('danger',error.msg);
      });
      res.redirect(`edit?id=${id}`);
  
    //= if no errors then update data
    }else{

      files.findById(id).exec( (err,file) => {
        if(!file) return res.status(404).json({message : 'data not found'});

        //= check if there's a file with the updated title in Db
        files.findOne({title: updatedData.title},(err,doc) => {

          file.title = updatedData.title;
          file.description = updatedData.description;
          file.category = updatedData.category;
          
          if(doc){

            //= the found file is the same file that is being edited
            if(doc._id == id){
              //= save updated data
              file.save( (err,updateFile) => {
                req.flash('success','file updated!');
                res.render('view',{file,page: `${file.title}`});
              });

            //= there's already a title with the new information in the Db
            }else{
              req.flash('danger','title is already in use');
              res.redirect(`edit?id=${id}`);
            }
            
          }else{
            //= save updated data
            file.save( (err,updateFile) => {
              req.flash('success','file updated!');
              res.render('view',{file,page: `${file.title}`});
            });
          }
        });
      });
    }
});

//= delete file
router.delete('/delete', userAuth ,(req,res)=>{

  const id = req.query.id;

  files.findById(id).exec( (err,data) => {
    if(!data) return res.status(404).json({message : 'data not found'});

    const fileTitle = data.title;

    //= remove file
    gfs.remove({_id: data.fileId , root: 'uploads'});

    //= remove file data
    files.findByIdAndRemove(id).exec( (err) => {
      if(err) return res.status(404).json({message : 'unknow error'});

      req.flash('success',`file "${fileTitle}" deleted`);
      res.render('homepage', {page: 'home'});
    });
  });
});

//= pagination function
function pagination(req,res,searchData){

  const count = searchData.count;
  const page = searchData.page;
  const docs = searchData.docs;
  const category = searchData.category;
  const query = searchData.query;
      
    if(searchData.err){
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
          searchKey: query,
          currentPage: page,
          totalPages : totalPages,
          totalFiles: count,
          nextPage: nextPage,
          previousPage: previousPage,
          page: 'files'
        }

        res.render('files',dataObtained);
      }
}

module.exports = router;
