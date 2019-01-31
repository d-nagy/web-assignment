const express = require('express');

const Workout = require('../models/workout.model');
const Exercise = require('../models/exercise.model');
const Favourite = require('../models/favourite.model');

const router = express.Router();


router.get('/', (req, res) => {
    let workouts = Workout.getWorkouts();
    let Favourites = Favourite.getFavouritesByUsername(req.user.username);
    let favourites = Favourite.getFavouritesByUsername(req.user.username);

    let workoutsWithFavourites = []

    workouts.forEach(workout => {
        let hasFavourite = Favourites.find(r => r.slug === workout.slug);

        let workoutWithFavourites = Object.keys(workout).reduce((object, key) => {
            object[key] = workout[key];
            return object;
        }, {});
        
        if (hasFavourite) {
            workoutWithFavourites.favourite = true;
        }

        workoutsWithFavourites.push(workoutWithFavourites);
    });
    
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

    let data = {
        workouts: workoutsWithFavourites,
        exercises: exercises
    }

    res.status(200).json(data);
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


router.delete('/:slug', (req, res) => {
    Workout.deleteWorkout(req.params.slug, (err, status) => {
        if (err) {
            res.status(status).send(err.message);
        }
        res.status(status).send();
    });
});


module.exports = router;