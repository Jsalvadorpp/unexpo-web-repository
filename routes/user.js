var express = require('express');
var router = express.Router();
const pagination = require('../config/pagination').pagination;
const limitPerPage = require('../config/pagination').limitPerPage;
const userPermissions = require('../config/userPermissions');

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
                            resultsTitle: `Publicaciones hechas por : ${userFound.username}`,
                            count,
                            url,
                            err,
                            docs, 
                            profile: userFound
                        }

                        pagination(req,res,searchData,false);
                    }else{
                        res.render('data-notFound', {page: 'Información no disponible'});
                    }
                });
            }else{
                res.render('data-notFound', {page: 'Información no disponible'});
            }
        })
    });
});

//= ajax request 
router.post('/files', (req,res,next) => {

    let semester = req.body.semester;
    let mention = req.body.mention;
    let fileType = req.body.fileType;
    let userId = req.query.id;
    const page = parseInt(req.body.page || '1');

    let query = {userId}
    
    if(semester || semester!='') query.semester = semester;
    if(mention || mention!='') query.mention = mention;
    if(fileType || fileType!='') query.fileType = fileType;

    let urlFilters = [];

    if(semester || semester!='') urlFilters.push(`semester=${semester}`);
    if(mention || mention!='') urlFilters.push(`mention=${mention}`);
    if(fileType || fileType!='') urlFilters.push(`fileType=${fileType}`);

    const url = (urlFilters.length >= 1) ? `/user/files?id=${userId}&${urlFilters.join('&')}` : `/user/files?id=${userId}`;
    let ajaxStatus = true;

    files.countDocuments(query,(err,count) => {
      files.find(query)
      .limit(limitPerPage)
      .skip((page-1)*limitPerPage)
      .sort({_id: -1})
      .exec( (err,docs)=>{
        if(docs){
            users.findOne({googleId: userId},(err,userFound)=>{

                if(userFound){
                    const searchData = {
                        page,
                        resultsTitle: `Publicaciones hechas por ${userFound.username}`,
                        count,
                        url,
                        err,
                        docs,
                        profile: userFound
                    }
                    pagination(req,res,searchData,ajaxStatus);
                }else{
                    res.render('data-notFound', {page: 'Información no disponible'});
                }
            });
        }else{
            res.render('data-notFound', {page: 'Información no disponible'});
        }
      });
    });

});

router.get('/profile/edit', userPermissions , (req,res)=>{

    const id = req.query.id;

    users.findOne({googleId: id}).exec( (err,user) => {
        if(!user) return res.render('data-notFound', {page: 'Información no disponible'});
        
        res.render('profile', {user,page: `Perfil`});
    });

});

router.put('/edit', userPermissions , (req,res)=>{

    const id = req.query.id;

    const updatedData = {
        name: req.body.name,
        contact: req.body.contact,
        profileRole: req.body.profileRole,
        description: req.body.description
    };

    users.findOne({googleId: id}).exec( (err,user) => {
        if(!user) return res.render('data-notFound', {page: 'Información no disponible'});
        

        user.name = updatedData.name;
        user.contact = updatedData.contact;
        user.profileRole = updatedData.profileRole;
        user.description = updatedData.description;

        user.save( (err,updateUser) => {
            req.flash('success','Perfil actualizado!');
            res.render('profile', {user,page: `Perfil`});
        });
    });

});


module.exports = router;