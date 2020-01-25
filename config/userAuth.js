var files = require('../models/uploads');

module.exports = (req,res,next) => {
   
    if(req.isAuthenticated()){
        
        const fileId = req.query.id;

        files.findById(fileId).exec( (err,file) => {
            if(!file) return res.render('data-notFound', {page: 'Información no disponible'});
        
            if(req.user.googleId == file.userId || req.user.role == 'admin'){
                return next();
            }else{
                req.flash('danger',`No tienes permiso para ver esta página`);
                res.redirect('/');
            }
        });
    }else{
        req.flash('danger',`No tienes permiso para ver esta página`);
        res.redirect('/');
    }
}