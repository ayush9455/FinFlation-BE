const express = require("express");
const dotenv = require("dotenv").config()
const errorHandler = require("./middlewares/errorHandler");
const app = express();
const port = process.env.PORT || 5002;
const emiRoutes = require("./routes/emiRoutes");
const sipRoutes = require("./routes/sipRoutes");

app.use(express.json());
app.use("/api/sip", sipRoutes);
app.use("/api/emi", emiRoutes);
app.get('/', (req, res) => {
    res.json({ message: "Server is Live" });
});
app.use(errorHandler);
app.listen(port, () => {
    console.log(`Server is Running on port ${port}`);
});