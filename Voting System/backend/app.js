const express = require("express");
const app = express();
const { Pool } = require("pg"); 
const config = require("config");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const cors = require("cors");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const http = require("http");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const allowedOrigins = ["http://localhost:5173"];

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// JSON parse error handler: return JSON on bad JSON instead of HTML stack trace
app.use((err, req, res, next) => {
  // body-parser / express.json() produces a SyntaxError with status 400 when JSON is invalid
  if (err && (err instanceof SyntaxError) && err.status === 400 && 'body' in err) {
    console.error('Invalid JSON payload:', err.message);
    return res.status(400).json({ success: false, message: 'Invalid JSON payload', error: err.message });
  }
  // some versions of body-parser set err.type === 'entity.parse.failed'
  if (err && err.type === 'entity.parse.failed') {
    console.error('Invalid JSON payload (entity.parse.failed):', err.message);
    return res.status(400).json({ success: false, message: 'Invalid JSON payload', error: err.message });
  }
  return next(err);
});
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET || "your-super-secret-key",
  })
);
app.use(flash());
app.use(express.static(path.join(__dirname, "../public")));

// auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// election routes
const electionRoutes = require('./routes/election');
app.use('/api/elections', electionRoutes);

// candidate routes
const candidateRoutes = require('./routes/candidate');
app.use('/api/candidates', candidateRoutes);

// const pool=new Pool({
//     host:process.env.PGHOST,
//     database:process.env.PGDATABASE,
//     user:process.env.PGUSER,
//     password:process.env.PGPASSWORD,
//     port:5432,
//     ssl:{
//         require:true,
//         rejectUnauthorized: false,  
//     }
// })

// pool.connect()
//   .then(() => console.log("✅ Connected to Neon PostgreSQL!"))
//   .catch(err => console.error("❌ Database connection error:", err.stack));


app.get("/", (req, res) => {
  res.send("Server running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
