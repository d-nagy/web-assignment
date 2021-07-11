const completedWorkouts = require('../data/completed_workouts.json');


const getAllCompletedWorkouts = () => {
  return completedWorkouts;
};


const getCompletedWorkoutsBySlug = (slug) => {
  return completedWorkouts.filter((completed) => completed.slug === slug);
};


const getCompletedWorkoutsByUsername = (username) => {
  return completedWorkouts.filter((completed) => completed.username === username);
};


const getCompletedWorkout = (slug, username, done) => {
  const completed = completedWorkouts.find((completed) => {
    return completed.slug === slug && completed.username === username;
  });

  if (completed) {
    return done(null, 200, completed);
  }
  return done(Error('Completion record not found'));
};


const addCompletedWorkout = (slug, username, done) => {
  getCompletedWorkout(slug, username, (err, status, result) => {
    if (err) {
      const completed = {
        slug: slug,
        username: username,
        count: 1,
        last_completed: Date.now(),
      };
      completedWorkouts.push(completed);
    } else {
      result.count += 1;
      result.last_completed = Date.now();
    }
    return done(null, 200);
  });
};


module.exports = {
  getAllCompletedWorkouts,
  getCompletedWorkout,
  getCompletedWorkoutsBySlug,
  getCompletedWorkoutsByUsername,
  addCompletedWorkout,
};
