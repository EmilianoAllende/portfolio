const { Router } = require("express");
const moviesRouter = Router();
const { moviesController, postMoviesController } = require("../controllers/moviesController");
const { moviePostInfoValidation } = require("../middlewares");

moviesRouter.get("/", moviesController);
moviesRouter.post("/", moviePostInfoValidation, postMoviesController);

module.exports = { moviesRouter };