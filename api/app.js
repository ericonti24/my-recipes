const express = require("express");
const cors = require("cors");

const recipesRouter = require("./routes/recipes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/recipes", recipesRouter);

app.get("/", (req, res) => {
    res.json({
        message: "Recipe API is running!"
    });
});

module.exports = app;