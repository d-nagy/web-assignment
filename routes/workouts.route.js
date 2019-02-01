const express = require('express');

const Workout = require('../models/workout.model');
const Exercise = require('../models/exercise.model');
const Favourite = require('../models/favourite.model');
const CompletedWorkout = require('../models/completed_workout.model');

const router = express.Router();


function isToday(date) {
    let today = new Date();
    return date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();
}

function timeSince(date) {
    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);
    if (interval > 1) {
        return interval + " years";
    }

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }

    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }

    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }

    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }

    return Math.floor(seconds) + " seconds";
};


function getExercisesForWorkouts(workouts) {
    let lookup = {};
    let exercises = []

    for (var workout, i = 0; workout = workouts[i++];) {
        for (var block, j = 0; block = workout.routine[j++];) {
            if (block.type === 'exercise-single') {
                if (!(block.slug in lookup)) {
                    lookup[block.slug] = 1;
                    Exercise.getExercise(block.slug, (err, status, result) => {
                        if (!err) {
                            exercises.push(result);
                        }
                    });
                }
            } else if (block.type === 'exercise-block') {
                for (var item, k = 0; item = block.exercises[k++];) {
                    if (item.type === 'exercise-single' && !(item.slug in lookup)) {
                        lookup[item.slug] = 1;
                        Exercise.getExercise(item.slug, (err, status, result) => {
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


function addWorkoutStats(workouts, favourites, completedWorkouts) {
    let workoutsWithStats = []

    workouts.forEach(workout => {
        let hasFavourite = favourites.find(r => r.slug === workout.slug);
        let hasBeenCompleted = completedWorkouts.find(c => c.slug === workout.slug);

        let workoutWithStats = Object.keys(workout).reduce((object, key) => {
            object[key] = workout[key];
            return object;
        }, {});
        
        if (hasFavourite) {
            workoutWithStats.favourite = true;
        }

        if (hasBeenCompleted) {
            workoutWithStats.complete_count = hasBeenCompleted.count;
            
            let can_complete = !isToday(new Date(hasBeenCompleted.last_completed));
            workoutWithStats.can_complete = can_complete;
        } else {
            workoutWithStats.complete_count = 0;
            workoutWithStats.can_complete = true;
        }

        workoutsWithStats.push(workoutWithStats);
    });

    return workoutsWithStats;
}


router.get('/', (req, res) => {
    let workouts = Workout.getWorkouts();
    let favourites = Favourite.getFavouritesByUsername(req.user.username);
    let completedWorkouts = CompletedWorkout.getCompletedWorkoutsByUsername(req.user.username);

    let workoutsWithStats = addWorkoutStats(workouts, favourites, completedWorkouts);
    let exercises = getExercisesForWorkouts(workouts);

    let data = {
        workouts: workoutsWithStats,
        exercises: exercises
    }

    res.status(200).json(data);
});


router.get('/recent', (req, res) => {
    Workout.getMostRecentWorkout(req.user.username, (err, status, result) => {
        if (!err) {
            let data = {};
            let time_since = 'Never';
            
            if (result.last_completed > 0) {
                time_since = timeSince(new Date(result.last_completed));
                
                Favourite.getFavourite(result.slug, req.user.username, (err, status, favourite) => {
                    if (!err) {
                        result.favourite = true;
                    } else {
                        result.favourite = false;
                    }
                });

                CompletedWorkout.getCompletedWorkout(result.slug, req.user.username, (err, status, completed) => {
                    if (!err) {
                        result.complete_count = completed.count;
                        result.can_complete = !isToday(new Date(completed.last_completed));
                    } else {
                        return res.status(status).send(err.message);
                    }
                });

                let exercises = getExercisesForWorkouts([result]);
                data.exercises = exercises;
            }
            result.time_since = time_since;

            data.workout = result;

            res.status(status).json(data);
        } else {
            res.status(status).send(err.message);
        }
    });
});


router.get('/complete', (req, res) => {
    Workout.getMostCompletedWorkout(req.user.username, (err, status, result) => {
        if (!err) {
            let data = {};

            if (result.complete_count > 0) {
                Favourite.getFavourite(result.slug, req.user.username, (err, status, favourite) => {
                    if (!err) {
                        result.favourite = true;
                    } else {
                        result.favourite = false;
                    }
                });

                CompletedWorkout.getCompletedWorkout(result.slug, req.user.username, (err, status, completed) => {
                    if (!err) {
                        result.complete_count = completed.count;
                        result.can_complete = !isToday(new Date(completed.last_completed));
                    } else {
                        return res.status(status).send(err.message);
                    }
                });

                let exercises = getExercisesForWorkouts([result]);

                data.exercises = exercises;
            }

            data.workout = result;

            res.status(status).json(data);
        } else {
            res.status(status).send(err.message);
        }
    });
});


router.post('/', (req, res) => {
    let formData = JSON.parse(req.body.formData);
    let wkData = JSON.parse(req.body.wkData);

    let workout = {
        title: formData.wkTitle,
        description: formData.wkDescription,
        author: formData.username,
        routine: wkData
    };

    Workout.addWorkout(workout, (err, status) => {
        if (err) {
            res.status(status).send(err.message);
        }
        res.status(status).send();
    });
});


router.put('/wotd', (req, res) => {
    Workout.setWorkoutOfTheDay(req.body.slug, (err, status) => {
        if (err) {
            res.status(status).send(err.message);
        }
        res.status(status).send();
    });
});


router.put('/setfav', (req, res) => {
    Workout.setFavourite(req.body.slug, req.user.username, req.body.favourite, (err, status) => {
        if (err) {
            res.status(status).send(err.message);
        }
        res.status(status).send();
    });
});


router.put('/complete', (req, res) => {
    Workout.completeWorkout(req.body.slug, req.user.username, (err, status) => {
        if (err) {
            res.status(status).send(err.message);
        }
        res.status(status).send();
    });
});


router.delete('/:slug', (req, res) => {
    Workout.deleteWorkout(req.params.slug, (err, status) => {
        if (err) {
            res.status(status).send(err.message);
        }
        res.status(status).send();
    });
});


module.exports = router;