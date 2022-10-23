const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    manager_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    active: { type: Boolean, required: true },
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        default: null,
    },
    task_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
});

// virtual to find which project that the user apart of
UserSchema.virtual('project', {
    ref: 'Project',
    localField: '_id',
    foreignField: 'user_ids',
});

// validate that user only has tasks from a specific project

const User = mongoose.model('User', UserSchema);

module.exports = User;
