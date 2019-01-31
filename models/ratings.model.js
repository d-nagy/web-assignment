let ratings = require('../data/ratings.json');


const getAllRatings = () => {
    return ratings.ratings;
}


const getAllFavourites = () => {
    return ratings.favourites;
};


const getRatingsBySlug = (slug) => {
    return ratings.ratings.filter(rating => rating.slug === slug);
};


const getRatingsByUsername = (username) => {
    return ratings.ratings.filter(rating => rating.username === username);
};


const getRating = (slug, username, done) => {
    let rating = ratings.ratings.find(rating => {
        return rating.slug === slug && rating.username === username;
    });

    if (rating) {
        return done(null, 200, rating);
    }
    return done(Error('Rating not found'), 404);
};


const getFavouritesBySlug = (slug) => {
    return ratings.favourites.filter(favourite => favourite.slug === slug);
};


const getFavouritesByUsername = (username) => {
    return ratings.favourites.filter(favourite => favourite.username === username);
};


const getFavourite = (slug, username, done) => {
    let favourite = ratings.favourites.find(favourite => {
        return favourite.slug === slug && favourite.username === username;
    });

    if (favourite) {
        return done(null, 200, favourite);
    }
    return done(Error('Rating not found'), 404);
};


const addFavourite = (slug, username, done) => {
    let favourite = {
        slug: slug,
        username: username
    };

    getFavourite(slug, username, (err, status, result) => {
        if (err) {
            ratings.favourites.push(favourite);
            return done(null, 200);
        }
        return done(Error('Favourite already exists'), 400);
    });
};


const removeFavourite = (slug, username, done) => {
    getFavourite(slug, username, (err, status, result) => {
        if (!err) {
            ratings.favourites.splice(ratings.favourites.indexOf(result), 1);
        }
        return done(err, status);
    });
};


module.exports = {
    getAllRatings,
    getAllFavourites,
    getRatingsBySlug,
    getFavouritesBySlug,
    getRatingsByUsername,
    getFavouritesByUsername,
    getRating,
    getFavourite,
    addFavourite,
    removeFavourite
}