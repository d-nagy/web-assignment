const express = require('express');
const httpError = require('http-errors');

const router = express.Router();

router.use((req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error_message', 'You need to be logged in to view this page.');
    return res.redirect('/login');
  } else if (!req.user.admin) {
    return next(httpError(403));
  } else {
    next();
  }
});

router.get('/', (req, res) => {
  return res.render('workouts');
});

router.get('/member', (req, res) => {
  return res.render('members');
});

router.get('/exercise', (req, res) => {
  return res.render('exercises');
});

router.get('/workout', (req, res) => {
  return res.render('workouts');
});


module.exports = router;
