var express = require('express');
var router = express.Router();
const limitPerPage = 5;

//= getting tags from database
var tags = require('../models/tags');
//= getting data from upload database
var files = require('../models/uploads');

//= get suggestions
router.get('/suggestions', (req, res) => {

    const term = req.query.term;
    var regex = new RegExp('^' + term, "i");

    tags.find({name: regex})
        .limit(5)
        .exec( (err,data) => {

            let suggestions = data.map(tag => tag.name);
            res.json({suggestions});
        });
});

//= view files by tag
router.get('/files', (req,res)=>{

    const tag = req.query.tag;
    const page = parseInt(req.query.page || '1');
    const search = {tags: tag}

    tags.findOne({name: tag},(err,found)=>{
        if(found){

            files.countDocuments(search,(err,count)=>{
                files.find(search)
                .limit(limitPerPage)
                .skip((page-1)*limitPerPage)
                .sort({_id: -1})
                .exec((err,docs)=>{

                    const searchData = {
                        page,
                        count,
                        category: null,
                        query: tag,
                        err,
                        docs
                    }
                    pagination(req,res,searchData);
                });
            });
        }else{
            res.status(404).json({message : 'data not found'});
        }
    });
});

//= pagination function
function pagination(req,res,searchData){

    const count = searchData.count;
    const page = searchData.page;
    const docs = searchData.docs;
    const category = searchData.category;
    const query = searchData.query+' tag';
        
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
