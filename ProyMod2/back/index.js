require("dotenv").config();
const app = require("./src/server");
const dbCon = require("./src/config/dbConfig");

dbCon().then((res) => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`"Server listening on port `${PORT}.`");
    });
})

.catch(err => {
    console.log("Error connecting database.", err);
})
