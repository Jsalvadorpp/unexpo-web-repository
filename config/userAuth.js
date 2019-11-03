var files = require('../models/uploads');

module.exports = (req,res,next) => {

    if(req.isAuthenticated()){
        
        const fileId = req.query.id;

        files.findById(fileId).exec( (err,file) => {
            if(!file) return res.status(404).json({message : 'data not found'});
          
            //note to myself: add admin role
            if(req.user.username == file.createdBy){
                return next();
            }else{
                req.flash('danger',`you don't have permission`);
                res.redirect('/');
            }
        });
    }else{
        req.flash('danger',`you don't have permission`);
        res.redirect('/');
    }
}