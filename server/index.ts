import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "TrainSmart API Running",
    version: "3.1.0"
  });
});

app.get("/api", (req, res) => {
  res.json({ 
    message: "Welcome to TrainSmart API",
    version: "3.1.0"
  });
});

app.get("/api/programs", (req, res) => {
  res.json({ message: "Programs endpoint coming soon" });
});

app.get("/api/workouts", (req, res) => {
  res.json({ message: "Workouts endpoint coming soon" });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
