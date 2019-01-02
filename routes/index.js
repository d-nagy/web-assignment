const express = require('express');
const passport = require('passport');


const auth = require('./auth');
const people = require('./people');


const router = express.Router();


router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.send('You are logged in!');
    } else {
        res.redirect('/login');
    }
});


router.use('/', auth);
router.use('/people/', people);


module.exports = router;