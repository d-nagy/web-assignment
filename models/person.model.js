const bcrypt = require('bcryptjs');

const people = require('../data/people.json');


const getPeople = () => {
  return people;
};


const getPerson = (username, done) => {
  const person = people.find((p) => p.username === username);
  if (person) {
    return done(null, 200, person);
  }
  return done(Error('Person not found'), 404, null);
};


const addPerson = (data, done) => {
  if (!(data.username && data.forename && data.surname)) {
    return done(Error('Invalid person object'), 400);
  }

  if (!data.password) {
    data.password = bcrypt.hashSync(data.username);
  } else {
    const hash = bcrypt.hashSync(data.password);
    data.password = hash;
  }

  getPerson(data.username, (err, status, result) => {
    if (err) {
      data.admin = false;
      data.level = 0;
      data.wk_completed = 0;
      data.daily_completed = 0;
      people.push(data);
      return done(null, 200);
    } else {
      return done(Error('Username already taken'), 400);
    }
  });
};

const promotePerson = (username, role, done) => {
  getPerson(username, (err, status, result) => {
    if (!err) {
      if (!result.admin) {
        result.admin = true;
        result.level = 1;
        result.role = role;
        result.ex_created = 0;
        result.wk_created = 0;
        return done(null, 200);
      }
      return done(Error('User already admin'), 400);
    }
    return done(err, status);
  });
};

const demotePerson = (username, done) => {
  getPerson(username, (err, status, result) => {
    if (!err) {
      if (result.admin) {
        if (result.level === 1) {
          result.admin = false;
          result.level = 0;
          result.role = '';
          return done(null, 200);
        }
        return done(Error('Cannot remove level 2 admin'), 400);
      }
      return done(Error('User not admin'), 400);
    }
    return done(err, status);
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
  promotePerson,
  demotePerson,
  deletePerson,
};
