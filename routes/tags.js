var express = require('express');
var router = express.Router();

//= getting tags from database
var tags = require('../models/tags');


router.get('/suggestions', (req, res) => {

    const term = req.query.term;
    var regex = new RegExp('^' + term, "i");

    tags.find({name: regex})
        .limit(5)
        .exec( (err,data) => {

            let suggestions = data.map(tag => tag.name);
            res.json({suggestions});
        });
});

module.exports = router;
