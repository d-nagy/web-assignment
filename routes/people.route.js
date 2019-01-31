const express = require('express');
const Person = require('../models/person.model')
const secret_token = require('../routes/auth.route').secret_token;

const router = express.Router();


router.get('/', (req, res) => {
    res.status(200);
    res.contentType('application/json');
    let people = Person.getPeople();
    let peopleNoPasswords = []
    
    for (let person, i = 0; person = people[i++];) {
        let personNoPassword = Object.keys(person).reduce((object, key) => {
            if (key !== 'password') {
                object[key] = person[key];
            }
            return object;
        }, {});
        peopleNoPasswords.push(personNoPassword);
    }

    res.send(peopleNoPasswords);
});

router.get('/:username', (req, res) => {
    Person.getPerson(req.params.username, (err, status, result) => {
        if (err) {
            res.status(status).send(err.message);
        } else {
            let personNoPassword = Object.keys(result).reduce((object, key) => {
                if (key !== 'password') {
                    object[key] = result[key];
                }
                return object;
            }, {});
            res.contentType('application/json');
            res.status(status).send(personNoPassword);
        }
    });
});

router.post('/', (req, res) => {
    if (req.body.access_token === secret_token) {
        let person = {
            username: req.body.username,
            forename: req.body.forename,
            surname: req.body.surname,
            password: req.body.password
        };
        Person.addPerson(person, (err, status) => {
            if (err) {
                res.status(status).send(err.message);
            }
            res.status(status).send();
        });
    } else {
        res.status(403).send('Incorrect access_token');
    }
});

router.put('/promote', (req, res) => {
    Person.promotePerson(req.body.username, req.body.role, (err, status) => {
        if (err) {
            res.status(status).send(err.message);
        }
        res.status(status).send();
    });
});

router.put('/demote', (req, res) => {
    Person.demotePerson(req.body.username, (err, status) => {
        if (err) {
            res.status(status).send(err.message);
        }
        res.status(status).send();
    });
});

router.delete('/:username', (req, res) => {
    if (req.body.access_token === secret_token) {
        Person.deletePerson(req.params.username, (err, status) => {
            if (err) {
                res.status(status).send(err.message);
            }
            res.status(status).send();
        });
    } else {
        res.status(403).send('Incorrect access_token');
    }
});


module.exports = router;