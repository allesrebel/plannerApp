const mongoose = require('mongoose');

const TimelineSchema = new mongoose.Schema({
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
});

// validate that time information makes sense (not in the past)

const TaskSchema = new mongoose.Schema(
    {
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
            type: TimelineSchema,
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
    },
    {
        toJSON: { virtual: true },
        toObject: { virtual: true },
    }
);

// virtuals for this Schema to find which project this task belongs to
TaskSchema.virtual('project', {
    ref: 'Project',
    localField: '_id',
    foreignField: 'task_ids',
});

// validate that user belongs only to this project

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;
