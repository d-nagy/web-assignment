const express = require('express');

const Workout = require('../models/workout.model');

const router = express.Router();


router.get('/', (req, res) => {
    let workouts = Workout.getWorkouts();
    res.status(200).json(workouts);
});


router.post('/', (req, res) => {
    let formData = JSON.parse(req.body.formData);
    let wkData = JSON.parse(req.body.wkData);

    let workout = {
        title: formData.wkTitle,
        description: formData.wkDescription,
        routine: wkData
    };

    Workout.addWorkout(workout, (err, status) => {
        if (err) {
            res.status(status).send(err.message);
        }
        res.status(status).send();
    });
});


module.exports = router;