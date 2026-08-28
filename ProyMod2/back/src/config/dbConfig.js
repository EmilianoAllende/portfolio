const mongoose = require("mongoose");

const dbCon = async () => {
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
};

module.exports = dbCon;
