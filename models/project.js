const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
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
    task_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    user_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

// Validate a few things, although name is indexed (and therefore unique unless index is dropped)
// We can continue and validate everything else (making sure task_id's are NOT duplicates)
ProjectSchema.post('validate', async (doc, next) => {
    // check if only unique values exist in the task_ids array
    if (doc.user_ids.length !== new Set(doc.user_ids).size) {
        const err = new Error('Non-unique task in task_ids array');
        next(err);
    }

    // check if users are used in any other projects
    else next();
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;
