const { URL, URL2, myURL } = require("../utils/constants.js");
const moviesRender = require("./moviesRender.js");
const axios = require("axios");

const fetchMovies = async () => {
    try {
        const response = await axios.get(myURL);
        const data = response.data;

        const movies = data.data;

        if (Array.isArray(movies)) {
            moviesRender(movies);
        } else {
            console.error("Error: Response is not a movie's array.");
        }
    } catch (err) {
        console.error('Error getting movies:', err.message);
    }
};

fetchMovies();