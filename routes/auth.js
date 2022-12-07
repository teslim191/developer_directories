const express = require("express");
const router = express.Router();
const Dev = require("../models/Dev");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ensureAuth } = require("../middleware/auth");

// generate a token for a developer
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN, {
    expiresIn: "15m",
  });
};

// signup a developer
router.post("/signup", async (req, res) => {
  const { name, email, password, job_title, location } = req.body;

  try {
    if (!name || !email || !password || !job_title || !location) {
      res.status(400).json({ message: "all fields are required" });
    } else if (password.length < 6 || password.length > 12) {
      res.status(400).json({ message: "password too short or too long" });
    } else {
      let dev = await Dev.findOne({ email });
      if (dev) {
        res.status(400).json({ message: "user already exists" });
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(password, salt);
        dev = await Dev.create({
          name,
          email,
          password: hashedpassword,
          job_title,
          location,
        });
        res.status(201).json({
          name: dev.name,
          email: dev.email,
          job_title: dev.job_title,
          location: dev.location,
          token: generateToken(dev.id),
        });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

// login a developer
// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let dev = await Dev.findOne({ email });

    if (dev && (await bcrypt.compare(password, dev.password))) {
      res.status(201).json({
        _id: dev.id,
        name: dev.name,
        email: dev.email,
        token: generateToken(dev.id),
      });
    } else {
      res.status(400).json({ message: "Email or Password incorrect" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

// logout a developer
router.put("/logout", (req, res) => {
  // check if request is valid
  const authHeader = req.headers["authorization"];

  // replace JWT token with blank string and expires in 1 second
  jwt.sign(
    authHeader,
    "",
    {
      expiresIn: 1,
    },
    (logout, err) => {
      if (logout) {
        res.status(200).json({ message: "You have successfully logged out" });
      } else {
        console.log(err);
      }
    }
  );
});

module.exports = router;
