const ProjectService = require('../services/project');

/* GET all projects listing w/ partial match search */
const getProjects = async (req, res) => {
    try {
        // check for the 'name' query params
        res.json(await ProjectService.getAllProjects(req));
    } catch (error) {
        // return all the projects
        res.status(500).json({ message: error.toString() });
    }
};

/* GET project by id. 
    Here's where we'll implement the logic specified by the assignment:
    There should be property which represents the manager of project
        + It should include the manager's _id, first, last, isActive, etc
    There should be a property represents all the tasks associated to the project
        + It should only include the _id of the task[,] name, and detail of the task (not the timeline object)
        was task name should be included too (typo? i think there's supposed to be',' 
        plus it  seems odd to have details but not task name)
*/
const getProjectById = async (req, res) => {
    try {
        const requestedId = req.params.id;
        res.status(200).json(await ProjectService.getProjectById(requestedId));
    } catch (error) {
        res.status(500).json({ message: error.toString() });
    }
};

/* POST project - create a project if unique name
    Other properties are optional, but we'll have the front end deal with that
*/
const createProject = async (req, res) => {
    // attempt to insert into database
    try {
        res.json(await ProjectService.createProject(req));
    } catch (error) {
        res.status(500).json({ message: error.toString() });
    }
};

/* PUT project - update a project by id if unique name
    In the controller, we'll validate the params, and deal with response
    Everything else will be handled in the service layer
*/
const updateProject = async (req, res) => {
    try {
        res.status(200).json(await ProjectService.updateProject(req));
    } catch (error) {
        res.status(500).json({ message: error.toString() });
    }
};

module.exports = { getProjects, getProjectById, createProject, updateProject };
