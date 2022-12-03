const express = require("express");
const router = express.Router();
const Dev = require("../models/Dev");
const { ensureAuth } = require("../middleware/auth");
const Project = require("../models/Project");
const moment = require("moment");
const { duration } = require("moment");

// get current loggedin developer
router.get("/me", ensureAuth, async (req, res) => {
  try {
    let dev = await Dev.findById({ _id: req.dev.id });
    res.status(200).json({
      name: dev.name,
      email: dev.email,
    });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

// get all developers in the database
router.get("/developers", ensureAuth, async (req, res) => {
  const pages = req.query.pages || 0;
  const devsPerPage = 5;
  try {
    let devs = await Dev.find()
      .select(" -password ")
      .skip(pages * devsPerPage)
      .limit(devsPerPage);
    if (!devs) {
      res.status(400).json({ message: "No Developer found" });
    } else {
      res.status(200).json(devs);
    }
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

// get a single developer
router.get("/developer/:id", ensureAuth, async (req, res) => {
  try {
    let dev = await Dev.findById({ _id: req.params.id }).select(
      " -_id -password "
    );
    if (!dev) {
      res.status(400).json({ message: "Developer does not exist" });
    } else {
      res.status(200).json(dev);
    }
  } catch (error) {
    console.log(error);
  }
});

// create a project
router.post("/project", ensureAuth, async (req, res) => {
  const { title, tool, start_date, end_date } = req.body;
  try {
    let startDate = moment(new Date(start_date)).format("YYYY-MM-DD");
    let endDate = moment(new Date(end_date)).format("YYYY-MM-DD");
    let diff =
      parseInt(moment(end_date).diff(moment(start_date), "hours")) / 24;
    let project = await Project.create({
      title,
      tool,
      start_date: startDate,
      end_date: endDate,
      duration: `${diff} days`,
      devs: req.dev.id,
    });
    res.status(201).json({
      title: project.title,
      tool: project.tool,
      start_date: project.start_date,
      end_date: project.end_date,
      duration: project.duration,
      devs: req.dev.name,
    });
  } catch (error) {
    console.log(error);
  }
});

// get all projects of single developer
router.get("/projects", ensureAuth, async (req, res) => {
  const pages = req.query.pages || 0;
  const projectsPerPage = 5;
  try {
    let projects = await Project.find({ devs: req.dev.id })
      .populate("devs")
      .select(" -_id -email -password -location -createdAt -updatedAt")
      .skip(pages * projectsPerPage)
      .limit(projectsPerPage);
    if (!projects) {
      res.status(404).json({ error: "this developer has no project" });
    } else {
      res.status(200).json(projects);

      // console.log(posts)
    }
  } catch (error) {
    console.log(error);
  }
});

// get a single project by its id
router.get("/project/:id", ensureAuth, async (req, res) => {
  try {
    let project = await Project.findById({ _id: req.params.id }).populate(
      "devs"
    );
    if (!project) {
      res.status(404).json({ error: "project does not exists" });
    } else {
      res.status(200).json({
        title: project.title,
        tool: project.tool,
        start_date: project.start_date,
        end_date: project.end_date,
        duration: project.duration,
        devs: project.devs.name,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
