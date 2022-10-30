const Task = require('../models/task');

const SharedService = require('./shared');

// shared method for checking time
const _canUpdateTask = async (id) => {
    const now = new Date().toISOString();
    const validTask = await Task.findOne({ _id: id, start: { $gte: now } });
    return Boolean(validTask);
};

const getAllTasks = async () => await SharedService.all(Task);

const getTaskById = async (id) => await SharedService.get(Task, id);

const createTask = async (body, user) =>
    await SharedService.create(Task, { ...body, user: user._id });

const updateTask = async (id, body) => {
    const canUpdate = await _canUpdateTask(id);

    if (canUpdate) {
        const updated = await Task.findByIdAndUpdate(id, body, {
            returnDocument: 'after',
        });
        return updated;
    } else {
        throw new Error(`Cannot update Task ${id}.`);
    }
};

const removeTask = async (id) => {
    const canUpdate = await _canUpdateTask(id);

    if (canUpdate) {
        const removed = await Task.findByIdAndDelete(id);
        return { deleted: removed };
    } else {
        throw new Error(`Cannot update Task ${id}.`);
    }
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    removeTask,
};
