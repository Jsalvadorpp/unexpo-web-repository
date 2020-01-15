var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const ensureAuth = require('../config/ensureAuth');
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

  //= page starts with index 0
  const page = parseInt(req.query.page || '1');
  const url = `/files`;
  const resultsTitle = 'Documentos';
  
  files.countDocuments({},(err,count) => {
    files.find({})
    .limit(limitPerPage)
    .skip((page-1)*limitPerPage)
    .sort({_id: -1})
    .exec( (err,docs)=>{

      const searchData = {
        page,
        count,
        resultsTitle,
        url,
        err,
        docs
      }

      const ajaxStatus = false;

      pagination(req,res,searchData,ajaxStatus);
    });
  });
});

//= ajax request 
router.post('/', (req,res,next) => {

    let semester = req.body.semester;
    let mention = req.body.mention;
    let fileType = req.body.fileType;
    const page = parseInt(req.body.page || '1');
    const resultsTitle = 'Documentos';

    let query = {}
    
    if(semester || semester!='') query.semester = semester;
    if(mention || mention!='') query.mention = mention;
    if(fileType || fileType!='') query.fileType = fileType;

    let urlFilters = [];

    if(semester || semester!='') urlFilters.push(`semester=${semester}`);
    if(mention || mention!='') urlFilters.push(`mention=${mention}`);
    if(fileType || fileType!='') urlFilters.push(`fileType=${fileType}`);

    const url = (urlFilters.length >= 1) ? `/files?${urlFilters.join('&')}` : '/files';
    let ajaxStatus = true;

    files.countDocuments(query,(err,count) => {
      files.find(query)
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
  
        pagination(req,res,searchData,ajaxStatus);
      });
    });

});

//= view indiviual file
router.get('/viewFile', (req,res,next) => {

  //= file metadata id
  fileId = req.query.id;

  files.findById(fileId).exec( (err,file) => {

    if(!file) res.render('data-notFound', {page: 'Informacion No Disponible'});

    res.render('view',{file,page: `${file.title}`});
  });
});

//= view all files using the search box
router.get('/search',(req,res) => {
  res.render('search',{page: 'Buscar en nuestra biblioteca de archivos'});
});

//= ajax request for search box
router.post('/search',(req,res) => {

  const page = parseInt(req.body.page || '1');
  const query = req.body.q;
  const url = `/files/search?q=${query}`;
  const resultsTitle = `Resultados de la busqueda: ${query}`;
  var regex = new RegExp(query, "i");

  const searchOptions = {
    $or: [
      {title: {$regex: regex}},
      {description: {$regex: regex}}
    ]
  };
  let ajaxStatus = true;
  let setfilters = false;

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

      pagination(req,res,searchData,ajaxStatus,setfilters);
    });
  });
});

//= download file
router.get('/download', (req,res,next) => {

  let downloadStatus = (req.query.status || true);
  
  //= file metadata id
  id = req.query.id;

  //= look for file data by id
  files.findById(id).exec( (err,data) => {

    if(!data) res.render('data-notFound', {page: 'Informacion No Disponible'});

    gfs.collection('uploads');

    //= look for the file itself
    gfs.files.findOne({_id: data.fileId} , (err,file) => {
      
      //= get file extension
      const extension = '.'+file.filename.split('.').pop();
  
      //= set file type
      res.set('Content-Type', file.contentType);
      //= set filename
      if (downloadStatus === true) res.attachment(data.title.trim()+extension);

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
    if(!file) return res.render('data-notFound', {page: 'Informacion No Disponible'});

    res.render('edit',{file,page: `${file.title}`});
  });
});

//= update file data
router.put('/edit', userAuth ,[
  //= check user input
  check('title')
    .not().isEmpty().withMessage('Se necesita el titulo'),
  check('description')
    .not().isEmpty().withMessage('se necesita la descripcion'),
  check('author')
    .not().isEmpty().withMessage('el autor es necesario')
  ],
  //= handle request and response
  (req,res) => {

    const tags = (req.body.tags == '')? null : (req.body.tags).split(',');

    const id = req.query.id;
    const updatedData = {
      title : req.body.title,
      description : req.body.description,
      mention : req.body.mention,
      semester: req.body.semester,
      author: req.body.author
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
        if(!file) res.render('data-notFound', {page: 'Informacion No Disponible'});

        //= check if there's a file with the updated title in Db
        files.findOne({title: updatedData.title},(err,doc) => {

          file.title = updatedData.title;
          file.description = updatedData.description;
          file.mention = updatedData.mention;
          file.semester = updatedData.semester;
          file.author = updatedData.author;
          file.tags = updatedData.tags;
          
          if(doc){

            //= the found file is the same file that is being edited
            if(doc._id == id){
              //= save updated data
              file.save( (err,updateFile) => {
                req.flash('success','archivo actualizado!');
                res.render('view',{file,page: `${file.title}`});
              });

            //= there's already a title with the new information in the Db
            }else{
              req.flash('danger','el titulo ya esta en uso');
              res.redirect(`edit?id=${id}`);
            }
            
          }else{
            //= save updated data
            file.save( (err,updateFile) => {
              req.flash('success','archivo actualizado!');
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
    if(!data) return res.render('data-notFound', {page: 'Informacion No Disponible'});

    const fileTitle = data.title;

    //= remove file
    gfs.remove({_id: data.fileId , root: 'uploads'});

    //= remove file data
    files.findByIdAndRemove(id).exec( (err) => {
      if(err) return res.render('data-notFound', {page: 'Informacion No Disponible'})

      req.flash('success',`archivo: "${fileTitle}" ha sido eliminado`);
      res.render('homepage', {page: 'home'});
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
