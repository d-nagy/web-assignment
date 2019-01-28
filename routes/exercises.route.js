const express = require('express');

const Exercise = require('../models/exercise.model');

const router = express.Router();


router.get('/', (req, res) => {
    let exercises = Exercise.getExercises();
    res.status(200).json(exercises);
});


router.post('/', (req, res) => {
    console.log(req.body);

    let exercise = {
        name: req.body.exName,
        description: req.body.exDescription,
        difficulty: req.body.exDifficulty
    };

    Exercise.addExercise(exercise, (err, status) => {
        if (err) {
            res.status(status).send(err.message);
        }
        res.status(status).send();
    });
});


router.delete('/:slug', (req, res) => {
    Exercise.deleteExercise(req.params.slug, (err, status) => {
        if (err) {
            res.status(status).send(err.message);
        }
        res.status(status).send();
    });
});


module.exports = router;