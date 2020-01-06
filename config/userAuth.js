var files = require('../models/uploads');

module.exports = (req,res,next) => {
   
    if(req.isAuthenticated()){
        
        const fileId = req.query.id;

        files.findById(fileId).exec( (err,file) => {
            if(!file) return res.status(404).json({message : 'error: informacion no encontrada'});
        
            if(req.user.googleId == file.userId || req.user.role == 'admin'){
                return next();
            }else{
                req.flash('danger',`no tienes permiso para ver esta página`);
                res.redirect('/');
            }
        });
    }else{
        req.flash('danger',`no tienes permiso para ver esta página`);
        res.redirect('/');
    }
}