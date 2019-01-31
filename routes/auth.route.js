const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');


const Person = require('../models/person.model');


const router = express.Router();

const secret_token = 'concertina';


router.post('/login', (req, res) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.log('Error has occured');
            req.flash('error', err.message);
            return res.redirect('/login');
        }
        req.login(user, (err) => {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('/login');
            }
            req.flash('success_message', 'You have logged in!');
            return res.redirect('/');
        });
    })(req, res);
});


router.post('/signup', (req, res) => {
    if (req.body.password !== req.body.confirm_password) {
        res.status(400).send('Password confirmation invalid');
    } else {
        Person.getPerson(req.body.username, (err, status, result) => {
            if (err) {
                return res.status(200).json({ access_token: secret_token });
            }
            return res.status(status).send(err.message);
        });
    }
});


router.get('/login', (req, res) => {
    res.render('login', { signup: req.query.signup });
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_message', 'You are now logged out.');
    res.redirect('/');
});


module.exports = { router: router, secret_token: secret_token };