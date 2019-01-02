const express = require('express');
const uuid = require('uuid/v4');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressValidator = require('express-validator');


const index = require('./routes/index');


const Person = require('./models/person');


const app = express();
var sessionStore = new session.MemoryStore;


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


passport.serializeUser((user, done) => {
    done(null, user.username);
});

passport.deserializeUser((username, done) => {
    Person.getPerson(username, (err, person) => {
        done(err, person);
    })
});

passport.use(new LocalStrategy({
    passReqToCallback: true
    }, 
    (req, username, password, done) => {
        Person.getPerson(username, (err, status, person) => {
            if (err) {
                if (status != 404) { return done(err); }
                return done(null, false, req.flash('error_message', 'Incorrect username.'));
            }
            
            if (!bcrypt.compareSync(password, person.password)) {
                return done(null, false, req.flash('error_message', 'Incorrect password.'));
            }

            return done(null, person, req.flash('success_message', 'You have successfully logged in!'));
        });
    })
);


app.use(session({
    genid: (req) => {
        return uuid();
    },
    secret: 'keyboard cat',
    store: sessionStore,
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(expressValidator());

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.use('/', index);


module.exports = app;