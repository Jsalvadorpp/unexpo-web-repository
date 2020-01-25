module.exports = (req,res,next) => {
    if(req.isAuthenticated()){
        if(req.user.role == 'admin'){
            return next();
        }else{
            req.flash('danger',`No tienes permiso para ver esta página`);
            res.redirect('/');
        }
    }else{
        req.flash('warning','Por favor accede con tu cuenta para ver esta página');
        res.redirect('/auth/login');
    }
}