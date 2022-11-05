const Project = require('../models/project');
const SharedService = require('./shared');

const getAllProjects = async () =>
    await SharedService.all(Project, ['user_ids', 'task_ids']);

const getProjectById = async (id) =>
    await SharedService.get(Project, id, ['user_ids', 'task_ids']);

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
