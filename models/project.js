const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            index: {
                unique: true,
                collation: { locale: 'en', strength: 2 },
            },
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        repository: {
            type: String,
            required: true,
        },
        manager_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// virtuals for this Schema to find which project this task belongs to
ProjectSchema.virtual('user_ids', {
    ref: 'User',
    localField: '_id',
    foreignField: 'project_id',
});

ProjectSchema.virtual('task_ids', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'project_id',
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;
