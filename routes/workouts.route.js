const express = require('express');

const Workout = require('../models/workout.model');
const Exercise = require('../models/exercise.model');
const Favourite = require('../models/favourite.model');
const CompletedWorkout = require('../models/completed_workout.model');

const router = express.Router();


const isToday = (date) => {
  const today = new Date();
  return date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate();
};

const getTimeSince = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return interval + ' years';
  }

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + ' months';
  }

  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + ' days';
  }

  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + ' hours';
  }

  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + ' minutes';
  }

  return Math.floor(seconds) + ' seconds';
};


const addWorkoutStats = (workouts, favourites, completedWorkouts) => {
  const workoutsWithStats = [];

  workouts.forEach((workout) => {
    const hasFavourite = favourites.find((r) => r.slug === workout.slug);
    const hasBeenCompleted = completedWorkouts.find((c) => c.slug === workout.slug);

    const workoutWithStats = Object.keys(workout).reduce((object, key) => {
      object[key] = workout[key];
      return object;
    }, {});

    if (hasFavourite) {
      workoutWithStats.favourite = true;
    }

    if (hasBeenCompleted) {
      workoutWithStats.complete_count = hasBeenCompleted.count;

      const canComplete = !isToday(new Date(hasBeenCompleted.last_completed));
      workoutWithStats.can_complete = canComplete;
    } else {
      workoutWithStats.complete_count = 0;
      workoutWithStats.can_complete = true;
    }

    workoutsWithStats.push(workoutWithStats);
  });

  return workoutsWithStats;
};


router.get('/', (req, res) => {
  const workouts = Workout.getWorkouts();
  const favourites = Favourite.getFavouritesByUsername(req.user.username);
  const completedWorkouts = CompletedWorkout.getCompletedWorkoutsByUsername(req.user.username);

  const workoutsWithStats = addWorkoutStats(
      workouts, favourites, completedWorkouts,
  );
  const exercises = Exercise.getExercisesForWorkouts(workouts);

  const data = {
    workouts: workoutsWithStats,
    exercises: exercises,
  };

  res.status(200).json(data);
});


router.get('/recent', (req, res) => {
  Workout.getMostRecentWorkout(req.user.username, (err, status, result) => {
    if (!err) {
      const data = {};
      let timeSince = 'Never';

      if (result.last_completed > 0) {
        timeSince = getTimeSince(new Date(result.last_completed));

        Favourite.getFavourite(
            result.slug, req.user.username, (err, status, favourite) => {
              if (!err) {
                result.favourite = true;
              } else {
                result.favourite = false;
              }
            });

        CompletedWorkout.getCompletedWorkout(
            result.slug, req.user.username, (err, status, completed) => {
              if (!err) {
                result.complete_count = completed.count;
                result.can_complete = !isToday(new Date(completed.last_completed));
              } else {
                return res.status(status).send(err.message);
              }
            });

        const exercises = Exercise.getExercisesForWorkouts([result]);
        data.exercises = exercises;
      }
      result.time_since = timeSince;

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
      const data = {};

      if (result.complete_count > 0) {
        Favourite.getFavourite(
              result.slug, req.user.username, (err, status, favourite) => {
              if (!err) {
                result.favourite = true;
              } else {
                result.favourite = false;
              }
            });

        CompletedWorkout.getCompletedWorkout(
              result.slug, req.user.username, (err, status, completed) => {
              if (!err) {
                result.complete_count = completed.count;
                result.can_complete = !isToday(new Date(completed.last_completed));
              } else {
                return res.status(status).send(err.message);
              }
            });

        const exercises = Exercise.getExercisesForWorkouts([result]);

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
  if (!req.isAuthenticated()) {
    return res.status(403).send();
  }

  const formData = JSON.parse(req.body.formData);
  const wkData = JSON.parse(req.body.wkData);

  const workout = {
    title: formData.wkTitle,
    description: formData.wkDescription,
    author: req.user.username,
    routine: wkData,
  };

  Workout.addWorkout(workout, (err, status) => {
    if (err) {
      res.status(status).send(err.message);
    }
    res.status(status).send();
  });
});


router.put('/wotd', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).send();
  }

  Workout.setWorkoutOfTheDay(req.body.slug, (err, status) => {
    if (err) {
      res.status(status).send(err.message);
    }
    res.status(status).send();
  });
});


router.put('/setfav', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).send();
  }

  Workout.setFavourite(
      req.body.slug, req.user.username, req.body.favourite, (err, status) => {
        if (err) {
          res.status(status).send(err.message);
        }
        res.status(status).send();
      });
});


router.put('/complete', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).send();
  }

  Workout.completeWorkout(req.body.slug, req.user.username, (err, status) => {
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

  Workout.deleteWorkout(req.params.slug, (err, status) => {
    if (err) {
      res.status(status).send(err.message);
    }
    res.status(status).send();
  });
});


module.exports = router;
