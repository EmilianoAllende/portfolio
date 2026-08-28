const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        min: "3",
        max: "50"
    },
    year: {
        type: Number,
        required: true,
        cast: '{VALUE} is not a number',
    },
    director: {
        type: String,
        required: true,
        min: "3",
        max: "50"
    },
    duration: {
        type: String,
        required: true,
    },
    genre: {
        type: [String],
        required: true,
    },
    rate: {
        type: Number,
        required: true,
    },
    poster: {
        type: String,
        required: true,
    }
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
