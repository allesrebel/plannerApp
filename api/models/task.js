const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    details: { type: String, required: true },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true,
    },
    status: {
        type: String,
        enum: ['assigned', 'in progress', 'in review', 'completed'],
        required: true,
    },
    timeline: {
        type: {
            date_assigned: {
                type: Date,
                required: true,
            },
            date_due: {
                type: Date,
                required: true,
            },
            date_updated: {
                type: Date,
                default: Date.now(),
            },
        },
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
});

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;
