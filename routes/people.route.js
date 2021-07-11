const express = require('express');
const Person = require('../models/person.model');
const secretToken = require('../routes/auth.route').secret_token;

const router = express.Router();


router.get('/', (req, res) => {
  res.status(200);
  res.contentType('application/json');
  const people = Person.getPeople();
  const peopleNoPasswords = [];

  for (let person, i = 0; person = people[i++];) {
    const personNoPassword = Object.keys(person).reduce((object, key) => {
      if (key !== 'password') {
        object[key] = person[key];
      }
      return object;
    }, {});
    peopleNoPasswords.push(personNoPassword);
  }

  res.send(peopleNoPasswords);
});

router.get('/self/get', (req, res) => {
  Person.getPerson(req.user.username, (err, status, result) => {
    if (err) {
      res.status(status).send(err.message);
    } else {
      const personNoPassword = Object.keys(result).reduce((object, key) => {
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

router.get('/:username', (req, res) => {
  Person.getPerson(req.params.username, (err, status, result) => {
    if (err) {
      res.status(status).send(err.message);
    } else {
      const personNoPassword = Object.keys(result).reduce((object, key) => {
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
  if (req.body.access_token === secretToken) {
    const person = {
      username: req.body.username,
      forename: req.body.forename,
      surname: req.body.surname,
      password: req.body.password,
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
  if (!req.isAuthenticated()) {
    return res.status(403).send();
  }

  Person.promotePerson(req.body.username, req.body.role, (err, status) => {
    if (err) {
      res.status(status).send(err.message);
    }
    res.status(status).send();
  });
});

router.put('/demote', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).send();
  }

  Person.demotePerson(req.body.username, (err, status) => {
    if (err) {
      res.status(status).send(err.message);
    }
    res.status(status).send();
  });
});

router.delete('/:username', (req, res) => {
  if (req.body.access_token === secretToken) {
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
