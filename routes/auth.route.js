const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');


const Person = require('../models/person.model');


const router = express.Router();


router.post('/login', (req, res) => {
    switch (req.body.action) {
        case "login":
            passport.authenticate('local', (err, user, info) => {
                if (err) {
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
            break;

        case "signup":
            if (req.body.password !== req.body.confirm_password) {
                req.flash('error_message', 'Password confirmation doesn\'t match password');
                res.redirect('login?signup=true');
            } else {
                let hash = bcrypt.hashSync(req.body.password);
                let person = {
                    forename: req.body.forename,
                    surname: req.body.surname,
                    username: req.body.username,
                    password: hash
                };
                Person.addPerson(person, (err, status) => {
                    if (err) {
                        req.flash('error_message', err.message);
                        res.redirect('/login?signup=true');
                    } else {
                        req.login(person, (err) => {
                            if (err) {
                                req.flash('error', err.message);
                                res.redirect('/login?signup=true');
                            }
                            return res.redirect('/');
                        });
                    }
                });
            }
            break;

        default:
            res.redirect('/login');
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


module.exports = router;