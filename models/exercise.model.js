const slugify = require('slugify');


let exercises = require('../data/exercises.json');


const getExercises = () => {
    return exercises;
};


const getExercise = (slug, done) => {
    let exercise = exercises.find(e => e.slug === slug);
    if (exercise) {
        return done(null, 200, exercise);
    }
    return done(Error('Exercise not found'), 404);
}; 


const addExercise = (data, done) => {
    if (!(data.name && data.description && data.difficulty)) {
        return done(Error('Invalid exercise object'), 400);
    }

    let slug = slugify(data.name);
    getExercise(slug, (err, status, result) => {
        if (err) {
            data['slug'] = slug;
            exercises.push(data);
            return done(null, 200);
        } else {
            return done(Error('Exercise already taken'), 400);
        }
    });
};


const deleteExercise = (slug, done) => {
    getExercise(slug, (err, status, result) => {
        if (!err) {
            exercises.splice(exercises.indexOf(result), 1);
        }
        return done(err, status);
    });
};


module.exports = {
    getExercises,
    getExercise,
    addExercise,
    deleteExercise
};