require("dotenv").config();

const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth");
const tasksRouter = require("./routes/tasks");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/tasks", tasksRouter);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
