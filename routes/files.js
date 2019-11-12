var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const { check, validationResult } = require('express-validator');
const userAuth = require('../config/userAuth');
const pagination = require('../config/pagination').pagination;
const limitPerPage = require('../config/pagination').limitPerPage;

//= getting data from upload database
var files = require('../models/uploads');

//= getting tags from database
var tagList = require('../models/tags');

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
  const url = `/files?category=${category}`;
  const resultsTitle = `Category: ${category}`
  const searchOption = { category };
  
  files.countDocuments(searchOption,(err,count) => {
    files.find(searchOption)
    .limit(limitPerPage)
    .skip((page-1)*limitPerPage)
    .sort({_id: -1})
    .exec( (err,docs)=>{

      const searchData = {
        resultsTitle,
        page,
        count,
        url,
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
  const url = `/files/search?q=${query}`
  const resultsTitle = `"${query}" Results:`
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
        resultsTitle,
        count,
        url,
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

    const tags = (req.body.tags == '')? null : (req.body.tags).split(',');

    const id = req.query.id;
    const updatedData = {
      title : req.body.title,
      description : req.body.description,
      category : req.body.category
    };

    if(tags != null){
      addTags(tags);
      updatedData.tags = tags;
    }else{
      updatedData.tags = null;
    }

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
          file.tags = updatedData.tags;
          
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

+router.get('/profile',(req,res) => {

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
    files.find({userId: req.user.googleId})
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
