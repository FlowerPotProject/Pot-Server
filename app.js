const express = require("express");
const morgan = require("morgan");
const controlRouter = require("./routes/control");
const viewRouter = require("./routes/view");
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set Routers
app.use("/control", controlRouter);
app.use("/view", viewRouter);

// error handler
app.use((req, res, next) => {
    res.status(404).send("Server error!");
});

app.use((err, req, res, next) => {
    console.error(err);
    res.send("Something failed!");
});

module.exports = app;
