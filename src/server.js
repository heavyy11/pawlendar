const express = require("express");
require("./config/db");

const app = express();
const PORT = 3000;

app.use(express.json());

//routes
const ownerRoutes = require("./routes/owner.routes");
app.use("/api/owners", ownerRoutes);

app.get("/", (req, res) => {
    res.send("lol testing lol");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});