var express = require('express');
var router = express.Router();
const ensureAuth = require('../config/ensureAuth');


//= get addFiles page
router.get('/', ensureAuth , (req, res, next) => {

  const pageData = {
    page: 'Upload'
  };

  res.render('upload', pageData);

});

module.exports = router;
