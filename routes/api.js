const express = require("express");
const router = express.Router();
const Dev = require("../models/Dev");
const { ensureAuth } = require("../middleware/auth");
const Project = require("../models/Project");
const moment = require("moment");
const { aggregate } = require("../models/Project");

// get current loggedin developer
router.get("/me", ensureAuth, async (req, res) => {
  try {
    let dev = await Dev.findById({ _id: req.dev.id });
    res.status(200).json({
      name: dev.name,
      email: dev.email,
      job_title: dev.job_title,
    });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

// get all developers in the database
router.get("/developers", ensureAuth, async (req, res) => {
  const pages = req.query.pages || 0;
  const devPerPage = 5;
  try {
    let dev = await Dev.find()
      .select(" -password ")
      .skip(pages * devPerPage)
      .limit(devPerPage);
    if (!dev) {
      res.status(400).json({ message: "No Developer found" });
    } else {
      res.status(200).json(dev);
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
    res.status(500).json({ error: "server error" });
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
      duration: diff,
      dev: req.dev.id,
    });
    res.status(201).json({
      _id: project._id,
      title: project.title,
      tool: project.tool,
      start_date: project.start_date,
      end_date: project.end_date,
      duration: `${project.duration} days`,
      dev: req.dev.name,
    });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

// get projects of all developer
router.get("/projects/all", ensureAuth, async (req, res) => {
  const pages = req.query.pages || 0;
  const projectsPerPage = 5;
  try {
    let projects = await Project.find()
      .lean()
      .sort({ createdAt: -1 })
      .populate("dev", "name job_title")
      // .select(" -_id -email -password -location -createdAt -updatedAt")
      .skip(pages * projectsPerPage)
      .limit(projectsPerPage);
    if (!projects) {
      res.status(404).json({ error: "this developer has no project" });
    } else {
      res.status(200).json(projects);

      // console.log(posts)
    }
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

// get all projects of single developer
router.get("/projects", ensureAuth, async (req, res) => {
  const pages = req.query.pages || 0;
  const projectsPerPage = 5;
  try {
    let projects = await Project.find({ dev: req.dev.id })
      .lean() 
      .sort({ createdAt: -1 })
      .populate("dev", "name job_title")
      // .select(" -_id -email -password -location -createdAt -updatedAt")
      .skip(pages * projectsPerPage)
      .limit(projectsPerPage);
    if (!projects) {
      res.status(404).json({ error: "this developer has no project" });
    } else {
      res.status(200).json(projects);

      // console.log(posts)
    }
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

// get a single project by its id
router.get("/project/:id", ensureAuth, async (req, res) => {
  try {
    let project = await Project.findById({ _id: req.params.id }).populate(
      "dev"
    );
    if (!project) {
      res.status(404).json({ error: "project does not exists" });
    } else {
      res.status(200).json({
        _id: project._id,
        title: project.title,
        tool: project.tool,
        start_date: project.start_date,
        end_date: project.end_date,
        duration: `${project.duration} days`,
        dev: project.dev.name,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});
// edit a developer detail
router.put("/developer/:id", ensureAuth, async (req, res) => {
  try {
    let dev = await Dev.findById({ _id: req.params.id });
    if (!dev) {
      res.status(404).json({ error: "this developer does not exist" });
    } else if (req.dev.id != dev._id) {
      res
        .status(400)
        .json({
          error: "you are not authorized to edit this developer details",
        });
    } else {
      dev = await Dev.findByIdAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });
      res.status(201).json(dev);
    }
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

// delete a developer
router.delete("/developer/:id", ensureAuth, async (req, res) => {
  try {
    let dev = await Dev.findById({ _id: req.params.id });
    if (!dev) {
      res.status(404).json({ error: "developer does not exist" });
    } else if (req.dev.id != dev._id) {
      res
        .status(400)
        .json({ error: "you are not authorized to delete this developer" });
    } else {
      dev = await Dev.findByIdAndDelete({ _id: req.params.id });
      res.status(200).json({ message: dev.name + " deleted succesfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

// edit a project
router.put("/project/:id", ensureAuth, async (req, res) => {
  try {
    let project = await Project.findById({ _id: req.params.id }).populate(
      "dev"
    );
    if (!project) {
      res.status(404).json({ error: "this project does not exist" });
    } else if (req.dev.id != project.dev._id) {
      res
        .status(400)
        .json({ error: "you are not authorized to edit this project details" });
    } else {
      project = await Project.findByIdAndUpdate(
        { _id: req.params.id },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
      res.status(201).json({
        title: project.title,
        tool: project.tool,
        start_date: project.start_date,
        end_date: project.end_date,
        duration: project.duration,
        dev: project.dev.name,
      });
    }
  } catch (error) {
    console.log(error);
    // res.status(500).json({error: 'server error'})
  }
});

// delete a project
router.delete("/project/:id", ensureAuth, async (req, res) => {
  try {
    let project = await Project.findById({ _id: req.params.id }).populate(
      "dev"
    );
    if (!project) {
      res.status(404).json({ error: "project does not exist" });
    } else if (req.dev.id != project.dev._id) {
      res
        .status(400)
        .json({
          error: "you are not authorized to delete this project document",
        });
    } else {
      project = await Project.findByIdAndDelete({ _id: req.params.id });
      res.status(200).json({ message: project.title + " deleted succesfully" });
    }
  } catch (error) {
    // console.log(error)
    res.status(500).json({ error: "server error" });
  }
});

// get stats
router.get('/stats', async(req, res) => {
  let stats = await Project.find().sort({"duration": -1}).limit(1)
  res.status(200).json(stats)
})
// router.get('/stats', async (req, res) => {
//   let stats = await Project.aggregate([
//     {
//       $group:{
//         duration: {$max: 1}
//       }
//     }
//   ])
// })

module.exports = router;
