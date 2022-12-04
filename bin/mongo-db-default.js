// Updated, earlier every relationship was made, even the redundant ones
// Instead, this only considers links that are unique between collections
// thank you for point that out!

// form a DB connection with mongoose
require('./database');

// Local Dependencies
const Project = require('../api/models/project');
const Task = require('../api/models/task');
const User = require('../api/models/user');

// finally pull in our mock data
const usersMockData = require('./mock_data/users.json');
const projectsMockData = require('./mock_data/projects.json');
const tasksMockData = require('./mock_data/tasks.json');

// Populate the DB with our Mock Data
const populateDB = async () => {
    // for debug purposes, we'll remove all elements from all tables
    await User.deleteMany({});
    await Task.deleteMany({});
    await Project.deleteMany({});

    // Create all users using the mock data
    for (const userMock of usersMockData) {
        const keepKeys = ['first_name', 'last_name', 'title', 'active'];
        const user = Object.fromEntries(
            keepKeys
                .filter((key) => key in userMock)
                .map((key) => [key, userMock[key]])
        );
        await User.create(user);
    }

    // Now that the users are created with ID's we can update each user in the table
    const ownerObj = await User.findOne({ title: 'Owner' });

    // update all users with manager ID of 1 to ownerObjId
    for (const user of await User.find({ manager_id: null })) {
        await User.findByIdAndUpdate(user._id, {
            $set: { manager_id: ownerObj._id },
        });
    }

    // next populate all the projects from the Mock Data
    for (const projectMock of projectsMockData) {
        const keepKeys = ['name', 'description', 'repository'];
        const project = Object.fromEntries(
            keepKeys
                .filter((key) => key in projectMock)
                .map((key) => [key, projectMock[key]])
        );
        project['manager_id'] = ownerObj._id;
        await Project.create(project);
    }

    // now we can finally make tasks and associate them with the correct project
    // and correct users
    for (const taskMock of tasksMockData) {
        const keepKeys = ['name', 'details', 'priority', 'status'];
        const task = Object.fromEntries(
            keepKeys
                .filter((key) => key in taskMock)
                .map((key) => [key, taskMock[key]])
        );

        // convert the timeline objects into dates
        task['timeline'] = {
            date_assigned: new Date(taskMock['timeline']['date_assigned']),
            date_due: new Date(taskMock['timeline']['date_due']),
        };

        // find the project associated with the task
        const taskMockIdToProjectNameMapping = {
            1: 'Super Cool Project',
            2: 'Kinda Coool Project',
        };
        const projectObj = await Project.findOne({
            name: taskMockIdToProjectNameMapping[taskMock.project_id],
        });
        task['project_id'] = projectObj._id;

        // find the user associated with the task
        const taskMockIdToUserTitleMapping = {
            1: 'Owner',
            2: 'SWE I',
            3: 'Contractor',
        };
        const userObj = await User.findOne({
            title: taskMockIdToUserTitleMapping[taskMock.user_id],
        });
        task['user_id'] = userObj._id;

        await Task.create(task);

        await userObj.updateOne({
            //$push: { task_ids: taskObj._id },
            $set: { project_id: projectObj._id },
        });
    }

    // Done!
    console.log('Database is Defaulted');
};

// Reuse the code from lab 3
populateDB().then(process.exit); // done!
