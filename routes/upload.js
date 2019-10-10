var express = require('express');
var router = express.Router();
const ensureAuth = require('../config/ensureAuth');
const GridFsStorage = require('multer-gridfs-storage');
const multer = require('multer');
const database = require('../config/databaseConfig');

//= get upload page
router.get('/', ensureAuth, (req, res, next) => {

  const pageData = {
    page: 'Upload'
  };

  res.render('upload', pageData);

});

//= database instance
const connection = database.connect;

//= create storage engine to save files
//= information added to the file when uploading
const storage = new GridFsStorage({
  db: connection,
  file: (req, file) => {
    return {
      filename: file.originalname,
      metadata: {
        createdBy: req.user.username,
        //something : req.body.category
      },
      bucketName: 'uploads'
    }
  }
});
const upload = multer({ storage });


//= upload file 
router.post('/', upload.single('file') , (req, res, next) => {
  console.log(req.file);
  const pageData = {
    page: 'Upload'
  };

  res.json({file: req.file});

});

module.exports = router;
