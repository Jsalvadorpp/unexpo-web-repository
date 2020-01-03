var express = require('express');
var router = express.Router();
const pagination = require('../config/pagination').pagination;
const limitPerPage = require('../config/pagination').limitPerPage;

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
    const url = `/tags/files?tag=${tag}`;
    const resultsTitle = `Etiqueta: ${tag}`
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
                        resultsTitle,
                        count,
                        url,
                        err,
                        docs
                    }
                    pagination(req,res,searchData);
                });
            });
        }else{
            res.status(404).json({message : 'datass not found'});
        }
    });
});

//= ajax request 
router.post('/files', (req,res,next) => {

    let semester = req.body.semester;
    let mention = req.body.mention;
    let fileType = req.body.fileType;
    let tag = req.query.tag;
    const page = parseInt(req.body.page || '1');
    const resultsTitle = `Etiqueta: ${tag}`;

    let query = {tags: tag}
    
    if(semester || semester!='') query.semester = semester;
    if(mention || mention!='') query.mention = mention;
    if(fileType || fileType!='') query.fileType = fileType;

    let urlFilters = [];

    if(semester || semester!='') urlFilters.push(`semester=${semester}`);
    if(mention || mention!='') urlFilters.push(`mention=${mention}`);
    if(fileType || fileType!='') urlFilters.push(`fileType=${fileType}`);

    const url = (urlFilters.length >= 1) ? `/tags/files?tag=${tag}&${urlFilters.join('&')}` : `/tags/files?tag=${tag}`;
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

module.exports = router;
