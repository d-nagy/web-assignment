const express = require('express');
const Person = require('../models/person.model')

const router = express.Router();


const secret_token = "concertina";


router.get('/', (req, res) => {
    res.status(200);
    res.contentType('application/json');
    let people = Person.getPeople();
    res.send(people);
});

router.get('/:username', (req, res) => {
    Person.getPerson(req.params.username, (err, status, result) => {
        if (err) {
            res.status(status).send(err.message);
        } else {
            res.contentType('application/json');
            res.status(status).send(result);
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