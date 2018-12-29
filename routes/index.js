const express = require('express');
const data = require('../data')


const router = express.Router();
var people = data.people;


const secret_token = "concertina";


router.get('/', (req, res) => {
    res.send('It works!');
});


router.get('/people', (req, res) => {
    res.status(200);
    res.contentType('application/json');
    res.send(people);
});


router.get('/people/:username', (req, res) => {
    let username = req.params.username;
    let person = people.find(p => p.username === username);

    if (person) {
        res.status(200);
        res.contentType('application/json');
        res.send(person);
    } else {
        res.status(404).send('Person not found.');
    }
});


router.post('/people', (req, res) => {
    if (req.get('access_token') === secret_token) {
        if (!people.find(p => p.username === req.get('username'))) {
            people.push({
                username: req.get('username'),
                forename: req.get('forename'),
                surname: req.get('surname')
            });
            res.status(200).send('Everything is good.');
        } else {
            res.status(400).send('Username already taken.');
        }
    } else {
        res.status(403).send('Incorrect access_token');
    }
});


module.exports = router;