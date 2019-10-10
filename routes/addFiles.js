var express = require('express');
var router = express.Router();
const ensureAuth = require('../config/ensureAuth');


//= get addFiles page
router.get('/', ensureAuth , (req, res, next) => {

  const pageData = {
    page: 'Add-Files',
  };

  res.render('addFile', pageData);

});

module.exports = router;
