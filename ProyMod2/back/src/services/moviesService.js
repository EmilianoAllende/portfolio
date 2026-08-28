const Movie = require("../models/Movie");

const getMoviesService = async () => {
    const movies = await Movie.find();
    return movies;
};

const createMovieService = async (movieData) => {
    const newMovie = new Movie({
        title: movieData.title,
        year: movieData.year,
        director: movieData.director,
        duration: movieData.duration,
        genre: movieData.genre,
        rate: movieData.rate,
        poster: movieData.poster
    });

    await newMovie.save();
};


module.exports = { getMoviesService, createMovieService };