module.exports = (req,res,next) => {
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash('warning','porfavor entra con tu cuenta para ver esta página');
        res.redirect('/auth/login');
    }
}