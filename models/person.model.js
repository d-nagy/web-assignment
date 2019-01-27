const bcrypt = require('bcryptjs');

let people = require('../data/people.json')


const getPeople = () => {
    return people;
};


const getPerson = (username, done) => {
    let person = people.find(p => p.username === username);
    if (person) {
        return done(null, 200, person);
    }
    return done(Error('Person not found'), 404);
}; 


const addPerson = (data, done) => {
    if (!(data.username && data.forename && data.surname)) {
        return done(Error('Invalid person object'), 400);
    }

    if (!data.password) {
        data.password = bcrypt.hashSync(data.username);
    }

    getPerson(data.username, (err, status, result) => {
        if (err) {
            people.push(data);
            return done(null, 200);
        } else {
            return done(Error('Username already taken'), 400);
        }
    });
};


const deletePerson = (username, done) => {
    getPerson(username, (err, status, result) => {
        if (!err) {
            people.splice(people.indexOf(result), 1);
        }
        return done(err, status);
    });
};


module.exports = {
    getPeople,
    getPerson,
    addPerson,
    deletePerson
};
