const slugify = require('slugify');


let workouts = require('../data/workouts.json');

let Person = require('../models/person.model');


const getWorkouts = () => {
    return workouts;
};


const getWorkout = (slug, done) => {
    let workout = workouts.find(wk => wk.slug === slug);
    if (workout) {
        return done(null, 200, workout);
    }
    return done(Error('Workout not found'), 404);
}; 


const getWorkoutOfTheDay = (done) => {
    let workout = workouts.find(wk => wk.wotd === true);
    if (workout) {
        return done(null, 200, workout);
    }
    let error = new Error('No workout of the day set');
    error.name = 'noWotd';
    return done(error, 404);
};


const addWorkout = (data, done) => {
    if (!(data.title && data.routine)) {
        return done(Error('Invalid workout object'), 400);
    }

    let author;
    Person.getPerson(data.author, (err, status, result) => {
        if (err) {
            return done(Error('Invalid workout author'), status);
        }
        author = result.forename + ' ' +  result.surname;
    });

    let slug = slugify(data.title);
    getWorkout(slug, (err, status, result) => {
        if (err) {
            data['slug'] = slug;
            data['author'] = author;
            data['rating'] = 0;
            data['favourites'] = 0;
            workouts.push(data);
            return done(null, 200);
        } else {
            return done(Error('Workout already taken'), 400);
        }
    });
};


const deleteWorkout = (slug, done) => {
    getWorkout(slug, (err, status, result) => {
        if (!err) {
            workouts.splice(workouts.indexOf(result), 1);
        }
        return done(err, status);
    });
};


const setWorkoutOfTheDay = (slug, done) => {
    getWorkoutOfTheDay((err, status, result) => {
        if (!err) {
            result.wotd = false;
        } else if (err.name !== 'noWotd') {
            return done(err, status);
        }
    });

    getWorkout(slug, (err, status, result) => {
        if (!err) {
            result.wotd = true;
            return done(null, status);
        }
        return done(err, status);
    });
};


module.exports = {
    getWorkouts,
    getWorkout,
    addWorkout,
    getWorkoutOfTheDay,
    setWorkoutOfTheDay,
    deleteWorkout
};