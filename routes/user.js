var express = require('express');
var router = express.Router();
const pagination = require('../config/pagination');
const limitPerPage = pagination.limitPerPage;

//= getting data from upload database
var files = require('../models/uploads');
//= getting users from database
var users = require('../models/users');

//= get files uploaded by the user
router.get('/files', (req,res)=>{

    const userId = req.query.id;
    const page = parseInt(req.query.page || '1');
    const url = `/user/files?id=${userId}`
    const search = {userId};

    files.countDocuments(search,(err,count)=>{
        files.find(search)
        .limit(limitPerPage)
        .skip((page-1)*limitPerPage)
        .sort({_id: -1})
        .exec((err,docs)=>{
            if(docs){
                users.findOne({googleId: userId},(err,userFound)=>{

                    if(userFound){
                        const searchData = {
                            page,
                            resultsTitle: `${userFound.username} files`,
                            count,
                            url,
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

module.exports = router;