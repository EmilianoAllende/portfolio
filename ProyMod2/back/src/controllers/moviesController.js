const { getMoviesService, createMovieService } = require("../services/moviesService");

const moviesController = async (req, res) => {
    try {
        const dataBase = await getMoviesService();

        res.status(200).json({
            message: "Everything is ok in slash.",
            data: dataBase
        });
    } catch (err) {
        res.status(500).json({
            message: "Error retrieving movies.",
            error: err.message
        });
    };
};

const postMoviesController = async (req, res) => {
    try {
        const { title, year, director, duration, genre, rate, description, poster } = req.body;
        await createMovieService(req.body);

        res.status(201).json({
            message: "New Movie created successfully.",
            data: req.body,
        });
        
    } catch (err) {
        res.status(500).json({
            message: "Error creating movie.",
            error: err.message
        });
    };
};


module.exports = { moviesController, postMoviesController };