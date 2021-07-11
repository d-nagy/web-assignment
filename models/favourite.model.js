const favourites = require('../data/favourites.json');


const getAllFavourites = () => {
  return favourites;
};


const getFavouritesBySlug = (slug) => {
  return favourites.filter((favourite) => favourite.slug === slug);
};


const getFavouritesByUsername = (username) => {
  return favourites.filter((favourite) => favourite.username === username);
};


const getFavourite = (slug, username, done) => {
  const favourite = favourites.find((favourite) => {
    return favourite.slug === slug && favourite.username === username;
  });

  if (favourite) {
    return done(null, 200, favourite);
  }
  return done(Error('Rating not found'), 404);
};


const addFavourite = (slug, username, done) => {
  const favourite = {
    slug: slug,
    username: username,
  };

  getFavourite(slug, username, (err, status, result) => {
    if (err) {
      favourites.push(favourite);
      return done(null, 200);
    }
    return done(Error('Favourite already exists'), 400);
  });
};


const removeFavourite = (slug, username, done) => {
  getFavourite(slug, username, (err, status, result) => {
    if (!err) {
      favourites.splice(favourites.indexOf(result), 1);
    }
    return done(err, status);
  });
};


module.exports = {
  getAllFavourites,
  getFavouritesBySlug,
  getFavouritesByUsername,
  getFavourite,
  addFavourite,
  removeFavourite,
};
