var express = require('express');
var router = express.Router();
const limitPerPage = 5;

//= getting data from upload database
var files = require('../models/uploads');
//= getting users from database
var users = require('../models/users');

//= get files uploaded by the user
router.get('/files', (req,res)=>{

    const userId = req.query.id;
    const page = parseInt(req.query.page || '1');
    const search = {userId};

    files.countDocuments(search,(err,count)=>{
        files.find(search)
        .limit(limitPerPage)
        .skip((page-1)*limitPerPage)
        .sort({_id: -1})
        .exec((err,docs)=>{
            if(docs){
                console.log(docs);
                users.findOne({googleId: userId},(err,userFound)=>{

                    if(userFound){
                        const searchData = {
                            page,
                            count,
                            category: null,
                            query: userFound.username,
                            err,
                            docs
                        }
                        pagination(req,res,searchData);
                    }else{
                        res.status(404).json({message : 'data not found'});
                    }
                });
            }else{
                res.status(404).json({message : 'data not found'});
            }
        })
    });
});

//= pagination function
function pagination(req,res,searchData){

    const count = searchData.count;
    const page = searchData.page;
    const docs = searchData.docs;
    const category = searchData.category;
    const query = searchData.query+' files';
        
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