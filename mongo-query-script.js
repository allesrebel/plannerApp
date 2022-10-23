// Global Dependencies
const mongoose = require('mongoose');

// Local Dependencies
const Project = require('./models/project');
const Task = require('./models/task');
const User = require('./models/user');

// finally pull in our mock data
const usersMockData = require('./mock_data/users.json');
const projectsMockData = require('./mock_data/projects.json');
const tasksMockData = require('./mock_data/tasks.json');

// Connect to our MongoDB instance using config.json's credentials (Part 2.1)
const { username, password, dbName } = require('./config.json');
const uri = `mongodb+srv://${username}:${password}@cluster0.ve805be.mongodb.net/${dbName}?retryWrites=true&w=majority`;
const part2step1 = async () => mongoose.connect(uri);

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
    const listOfUserUpdates = {};
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

        const taskObj = await Task.create(task);

        // record user that we'll want to eventually add to this Project
        if (listOfUserUpdates[projectObj._id] == null)
            listOfUserUpdates[projectObj._id] = [];
        listOfUserUpdates[projectObj._id].push(userObj._id);

        // finalize the relationships across, project and user
        await projectObj.updateOne({
            $push: { task_ids: taskObj._id },
        });

        await userObj.updateOne({
            $push: { task_ids: taskObj._id },
            $set: { project_id: projectObj._id },
        });
    }

    // finally post process the listOfUserUpdates object to remove duplicates
    for (const [project_id, user_ids] of Object.entries(listOfUserUpdates)) {
        // Remove duplicates by converting idObjects to strings
        const ids = user_ids.map((idObject) => idObject.toString());
        const unique_user_ids = user_ids.filter(
            // search, includes can use an offset to start from a different position
            (obj, offset) => !ids.includes(obj.toString(), offset + 1)
        );

        for (const user_id of unique_user_ids)
            await Project.findByIdAndUpdate(project_id, {
                $push: { user_ids: user_id },
            });
    }
};

// Populate the DB with our Mock Data
const part2step2 = async () => {
    await User.findOne().then((res) => {
        res = res.toObject({ virtuals: true });
        // clean up to match assignment details
        res['_id'] = res['_id'].toString();
        res['id'] = res['id'].toString();
        res['position'] = res['title'];
        delete res['title'];
        delete res['manager_id'];
        delete res['task_ids'];

        console.log('User');
        console.log(res);
    });
};

const part2step3 = async () => {
    await Task.findOne()
        .then((res) =>
            res.populate(
                'project',
                '-task_ids -user_ids -__v -manager_id -description -repository'
            )
        )
        .then((res) =>
            res.populate(
                'user',
                '-task_ids -title -active -project_id -manager_id'
            )
        )
        .then((res) => {
            // clean up the object before printing out (to match assignment)
            res = res.toObject({ virtuals: true });
            res['_id'] = res['_id'].toString();
            res['project'] = res['project'][0];
            res['project']['_id'] = res['project']['_id'].toString();
            res['user'] = res['user'][0];
            res['user']['_id'] = res['user']['_id'].toString();
            delete res['id'];
            delete res['user_id'];
            delete res['project_id'];
            delete res['timeline']['_id'];
            delete res['timeline']['id'];
            console.log('Task');
            console.log(res);
        });
};

const part2step4 = async () => {
    await Project.findOne()
        .then((res) =>
            res.populate('manager_id', '-manager_id -project_id -task_ids')
        )
        .then((res) =>
            res.populate(
                'task_ids',
                '-task_ids -title -active -manager_id -priority -status -timeline -user_id -__v'
            )
        )
        .then((res) => {
            // clean up the object before printing out (to match assignment)
            res = res.toObject({ virtuals: true });
            res['_id'] = res['_id'].toString();
            res['manager'] = res['manager_id'];
            res['manager']['_id'] = res['manager']['_id'].toString();
            delete res['manager_id'];
            for (const task of res['task_ids']) {
                task['project'] = task['project_id'].toString();
                task['_id'] = task['_id'].toString();
                delete task['project_id'];
            }
            res['user_ids'] = res['user_ids'].map((user_id) =>
                user_id.toString()
            );

            console.log('Project');
            console.log(res);
        });
};

part2step1()
    .then(populateDB)
    .then(part2step2)
    .then(part2step3)
    .then(part2step4)
    .then(process.exit); // done!
