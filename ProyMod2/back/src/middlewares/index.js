function moviePostInfoValidation(req, res, next) {
    const movieFields = ["title", "year", "director", "duration", "genre", "rate", "poster"];

    const movieMissingFields = movieFields.filter(field => !req.body[field]);

    if (movieMissingFields.length > 0) {
        return res.status(400).json({
            message: `Error during movie info validation. Missing fields: ${movieMissingFields.join(", ")}.`
        });
    }

    next();
}

module.exports = { moviePostInfoValidation };