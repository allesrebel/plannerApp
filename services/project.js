const Project = require('../models/project');
const SharedService = require('./shared');

const getAllProjects = async () => await SharedService.all(Project);

const getProjectById = async (id, populate_details = []) =>
    await SharedService.get(Project, id, populate_details);

const findProject = async (obj) => await Project.findOne(obj);

const createProject = async (body) => await SharedService.create(Project, body);

const removeProject = async (id) => await SharedService.remove(Project, id);

module.exports = {
    getAllProjects,
    getProjectById,
    createProject,
    removeProject,
    findProject,
};
