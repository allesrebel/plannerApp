const Project = require('../models/project');

const SharedService = require('./shared');

const getAllProjects = async () => await SharedService.all(Project);

const getProjectById = async (id) => await SharedService.get(Project, id);

const createProject = async (body) => await SharedService.create(Project, body);

const removeProject = async (id) => await SharedService.remove(Project, id);

module.exports = {
    getAllProjects,
    getProjectById,
    createProject,
    removeProject,
};
