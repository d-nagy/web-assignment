const slugify = require('slugify');


let workouts = require('../data/workouts.json');

let Person = require('../models/person.model');
let Favourite = require('../models/favourite.model');
let CompletedWorkout = require('../models/completed_workout.model');



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


const getMostRecentWorkout = (username, done) => {
    let completed = CompletedWorkout.getCompletedWorkoutsByUsername(username);

    if (completed.length > 0) {
        let recent = Math.max.apply(Math, completed.map(c => c.last_completed));
        let mostRecentSlug = completed.find(c => c.last_completed === recent).slug;
        
        getWorkout(mostRecentSlug, (err, status, result) => {
            if (!err) {
                let workoutWithTime = Object.keys(result).reduce((object, key) => {
                    object[key] = result[key];
                    return object;
                }, {});
                workoutWithTime.last_completed = recent;
                return done(null, 200, workoutWithTime);
            }
            return done(err, status);
        });
    } else {
        return done(null, 200, { last_completed: -1 });
    }
};


const getMostCompletedWorkout = (username, done) => {
    let completed = CompletedWorkout.getCompletedWorkoutsByUsername(username);

    if (completed.length > 0) {
        let count = Math.max.apply(Math, completed.map(c => c.count));
        let mostCompletedSlug = completed.find(c => c.count === count).slug;
        
        getWorkout(mostCompletedSlug, (err, status, result) => {
            if (!err) {
                let workoutWithCount = Object.keys(result).reduce((object, key) => {
                    object[key] = result[key];
                    return object;
                }, {});
                workoutWithCount.complete_count = count;
                return done(null, 200, workoutWithCount);
            }
            return done(err, status);
        });

    } else {
        return done(null, 200, { complete_count: 0 });
    }
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


const setFavourite = (slug, username, favourite, done) => {
    getWorkout(slug, (err, status, result) => {
        if (!err) {
            if (favourite > 0) {
                Favourite.addFavourite(slug, username, (err, status) => {
                    if (err) {
                        return done(err, status);
                    }
                    result.favourites += 1;
                    return done(null, 200);
                });
            } else {
                Favourite.removeFavourite(slug, username, (err, status) => {
                    if (err) {
                        return done(err, status);
                    }
                    result.favourites -= 1;
                    return done(null, 200);
                });
            }
        } else {
            return done(err, status);
        }
    });
};


const completeWorkout = (slug, username, done) => {
    getWorkout(slug, (err, status, workout) => {
        if (!err) {
            Person.getPerson(username, (err, status, person) => {
                if (!err) {
                    person.wk_completed += 1;
                    if (workout.wotd) {
                        person.daily_completed += 1;
                    }

                    CompletedWorkout.addCompletedWorkout(slug, username, (err, status) => {
                        return done(err, status);
                    });
                }
                return done(err, status);
            });
        }
        return done(err, status);
    });
};


module.exports = {
    getWorkouts,
    getWorkout,
    getMostRecentWorkout,
    getMostCompletedWorkout,
    addWorkout,
    getWorkoutOfTheDay,
    setWorkoutOfTheDay,
    setFavourite,
    completeWorkout,
    deleteWorkout
};