const express = require('express');

const Exercise = require('../models/exercise.model');

const router = express.Router();


router.get('/', (req, res) => {
  const exercises = Exercise.getExercises();
  res.status(200).json(exercises);
});


router.get('/:slug', (req, res) => {
  Exercise.getExercise(req.params.slug, (err, status, result) => {
    if (err) {
      res.status(status).send(err.message);
    }
    res.status(status).json(result);
  });
});


router.post('/', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).send();
  }

  const exercise = {
    name: req.body.exName,
    description: req.body.exDescription,
    difficulty: req.body.exDifficulty,
  };

  Exercise.addExercise(exercise, (err, status) => {
    if (err) {
      res.status(status).send(err.message);
    }
    res.status(status).send();
  });
});


router.delete('/:slug', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).send();
  }

  Exercise.deleteExercise(req.params.slug, (err, status) => {
    if (err) {
      res.status(status).send(err.message);
    }
    res.status(status).send();
  });
});


module.exports = router;
