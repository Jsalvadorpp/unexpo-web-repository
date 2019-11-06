module.exports = (req,res,next) => {
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash('warning','please login to view this page');
        res.redirect('/');
    }
}