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
    const resultsTitle = `Tag: "${tag}" results`
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
            res.status(404).json({message : 'data not found'});
        }
    });
});

module.exports = router;
