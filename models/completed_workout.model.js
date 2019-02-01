let completed_workouts = require('../data/completed_workouts.json');


const getAllCompletedWorkouts = () => {
    return completed_workouts;
};


const getCompletedWorkoutsBySlug = (slug) => {
    return completed_workouts.filter(completed => completed.slug === slug);
};


const getCompletedWorkoutsByUsername = (username) => {
    return completed_workouts.filter(completed => completed.username === username);
};


const getCompletedWorkout = (slug, username, done) => {
    let completed = completed_workouts.find(completed => {
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
            let completed = {
                slug: slug,
                username: username,
                count: 1,
                last_completed: Date.now()
            }
            completed_workouts.push(completed);
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
    addCompletedWorkout
}