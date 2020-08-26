var users = require('../models/users');

module.exports = (req,res,next) => {
   
    if(req.isAuthenticated()){
        
        const userID = req.query.id;

        users.findOne({googleId: userID}).exec( (err,user) => {
            if(!user) return res.render('data-notFound', {page: 'Información no disponible'});
            
            if(req.user.googleId == user.googleId){
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