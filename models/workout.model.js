const slugify = require('slugify');


let workouts = require('../data/workouts.json');


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


const addWorkout = (data, done) => {
    if (!(data.title && data.routine)) {
        return done(Error('Invalid workout object'), 400);
    }

    let slug = slugify(data.title);
    getWorkout(slug, (err, status, result) => {
        if (err) {
            data['slug'] = slug;
            data['difficulty'] = 0;
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


module.exports = {
    getWorkouts,
    getWorkout,
    addWorkout,
    deleteWorkout
};