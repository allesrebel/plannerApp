const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
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
        project_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            default: null,
        },
        active: { type: Boolean, required: true },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Shooot! Relationship should only be defined once
// we'll use virtuals to relate back to project ID and
// task IDs assigned to this particular User
// virtuals for this Schema to find which project this task belongs to
UserSchema.virtual('task_ids', {
    ref: 'Task',
    localField: 'task_ids',
    foreignField: '_id',
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
