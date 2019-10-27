var express = require('express');
var router = express.Router();

//= getting data from upload database
var files = require('../models/uploads');

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

  fileId = req.query.id;

  files.findById(fileId).exec( (err,file) => {

    if(!file) res.status(404).json({message : 'data not found'});


    
    res.render('view',{file,page: `${file.title}`});
  });


});

module.exports = router;
