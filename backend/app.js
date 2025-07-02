const express = require("express");
const connectToDb = require("./config/connectToDb")
require("dotenv").config();

//connection to db
connectToDb();

const app = express();


app.use(express.json());

app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/users", require("./routes/usersRoute"));
app.use("/api/posts", require("./routes/postsRoute"));

const PORT = process.env.PORT || 8000;

app.listen(PORT, ()=>console.log(`serer is running in ${process.env.NODE_ENV} mode on port ${PORT}`));
