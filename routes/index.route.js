const express = require('express');
// const passport = require('passport');

const auth = require('./auth.route');
const admin = require('./admin.route');
const people = require('./people.route');
const exercise = require('./exercises.route');
const workout = require('./workouts.route');


const router = express.Router();


router.get('/', (req, res) => {
    // console.log(req.session);
    if (req.isAuthenticated()) {
        // console.log(req.user);
        if (req.user.admin) {
            return res.redirect('/admin');
        }
        return res.render('index');
    } else {
        return res.redirect('/login');
    }
});


router.use('/', auth);
router.use('/admin/', admin);
router.use('/people/', people);
router.use('/exercise/', exercise);
router.use('/workout/', workout);


module.exports = router;