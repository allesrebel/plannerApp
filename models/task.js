const mongoose = require('mongoose');

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
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// virtuals for this Schema to find which project this task belongs to
TaskSchema.virtual('project', {
    ref: 'Project',
    localField: 'project_id',
    foreignField: '_id',
});

TaskSchema.virtual('user', {
    ref: 'User',
    localField: 'user_id',
    foreignField: '_id',
});

// validate that user belongs only to this project

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;
