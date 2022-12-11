const TaskService = require('../services/task');

/* GET tasks listing.
    Nothing special required by any assignment
*/
const getTasks = async (_, res) => {
    try {
        res.json(await TaskService.getAllTasks());
    } catch (error) {
        res.status(500).json({ message: error.toString() });
    }
};

/* GET task by id. 
    HW Requirements handled by Service Layer
*/
const getTaskById = async (req, res) => {
    try {
        res.status(200).json(await TaskService.getTaskById(req.params.id));
    } catch (error) {
        res.status(500).json({ message: error.toString() });
    }
};

/* POST task - create a task */
const createTask = async (req, res) => {
    try {
        res.status(200).json(await TaskService.createTask(req));
    } catch (error) {
        res.status(500).json({ message: `${error}` });
    }
};

/* PUT task - update a task by id 
    A task (name, detail and timeline object) is only able to be updated as long as the status is "assigned".  Status can always be updated.
*/
const updateTask = async (req, res) => {
    try {
        res.status(200).json(await TaskService.updateTask(req));
    } catch (error) {
        res.status(500).json({ message: `${error}` });
    }
};

/* DELETE task - delete a task by ID */
const deleteTask = async (req, res) => {
    try {
        await TaskService.removeTask(req);
        res.status(200).json({ message: `task ${req.params.id} deleted` });
    } catch (error) {
        res.status(500).json({ message: `${error}` });
    }
};

/* GET TaskStatusEnums
    to allow front end to have the right set of enums for forms
*/
const getTaskStatusEnum = (_, res) => {
    try {
        res.json(TaskService.getTaskStatusEnum());
    } catch (error) {
        res.status(500).json({ message: `${error}` });
    }
};

/* GET TaskPriorityEnums
    to allow front end to have the right set of enums for forms
*/
const getTaskPriorityEnum = (_, res) => {
    try {
        res.json(TaskService.getTaskPriorityEnum());
    } catch (error) {
        res.status(500).json({ message: `${error}` });
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,

    getTaskStatusEnum,
    getTaskPriorityEnum,
};
