const slugify = require('slugify');


let exercises = require('../data/exercises.json');

let Workout = require('../models/workout.model');

const getExercisesForWorkouts = (workouts) => {
    let lookup = {};
    let exercises = []

    for (var workout, i = 0; workout = workouts[i++];) {
        for (var block, j = 0; block = workout.routine[j++];) {
            if (block.type === 'exercise-single') {
                if (!(block.slug in lookup)) {
                    lookup[block.slug] = 1;
                    getExercise(block.slug, (err, status, result) => {
                        if (!err) {
                            exercises.push(result);
                        }
                    });
                }
            } else if (block.type === 'exercise-block') {
                for (var item, k = 0; item = block.exercises[k++];) {
                    if (item.type === 'exercise-single' && !(item.slug in lookup)) {
                        lookup[item.slug] = 1;
                        getExercise(item.slug, (err, status, result) => {
                            if (!err) {
                                exercises.push(result);
                            }
                        });
                    }
                }
            }
        }
    }

    return exercises;
}


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
    let workouts = Workout.getWorkouts();
    let exercises = getExercisesForWorkouts(workouts);

    getExercise(slug, (err, status, result) => {
        if (!err) {
            if (exercises.find(ex => ex === result)) {
                return done(Error('Exercise is used in workouts'), 400);
            }
            exercises.splice(exercises.indexOf(result), 1);
        }
        return done(err, status);
    });
};


module.exports = {
    getExercises,
    getExercise,
    addExercise,
    deleteExercise,
    getExercisesForWorkouts
};