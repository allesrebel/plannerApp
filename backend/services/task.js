const SharedService = require('./shared');
const ProjectService = require('./project');
const UserService = require('./user');

const Task = require('../models/task');

// ENUMs that will be used
const getTaskStatusEnum = () => {
    return Task.schema.path('status').enumValues;
};

const getTaskPriorityEnum = () => {
    return Task.schema.path('priority').enumValues;
};

// validation functions for task requests

// Validate that the request contains a valid
// task object (including validation rules)
// Probably should refactor this from here and project's controller
const validateRequest = async (req, currentState = null) => {
    // validate that we actually have a request
    if (Object.keys(req.body).length === 0)
        throw new Error(`input data is empty`);

    // validate the body of the request, + strip out un-needed properties
    const properties = [
        //'id', // assigned by db
        'name',
        'details',
        'priority',
        'status',
        'timeline',
        'user_id',
        'project_id',
    ];
    const reqObj = req.body;

    // create a map of the keys that we only want (dropping everything else)
    const extractedItems = properties.map((property) => {
        const newObj = {};
        // does our request object have the required property?
        // if so, replace the new object's value from the request object
        if (property in reqObj) {
            newObj[property] = reqObj[property];
        } else {
            newObj[property] = null;
        }
        return newObj;
    });

    // variables used during validation
    var requestedProjectId = null;

    // This is where we would check if all the items are here & valid
    for (const item of extractedItems) {
        // check for required properties!
        // for now, the only required properties is name, let user do updates to fill everything else out
        const [key, value] = Object.entries(item)[0];
        // note, we only check for existence IF we don't a current state saved in the DB
        if (currentState === null) {
            if (key === 'name' && value === null)
                throw new Error(`task name is required`);
            if (key === 'status' && value === null)
                throw new Error(`task status is required`);
            if (key === 'priority' && value === null)
                throw new Error(`task priority is required`);
        }

        // validate properties passed in

        // perform validation on priority
        if (key === 'priority' && value !== null) {
            if (!getTaskPriorityEnum().includes(value))
                throw new Error(
                    `priority ${value} is not any valid priorities of ${getTaskPriorityEnum()}`
                );
        }

        // perform validation on status
        if (key === 'status' && value !== null) {
            if (!getTaskStatusEnum().includes(value))
                throw new Error(
                    `status ${value} is not any valid statuses of ${getTaskStatusEnum()}`
                );
        }

        // perform validation on timeline
        if (key === 'timeline' && value !== null) {
            // Note: value is actually a full on Javascript Object, with properties and values
            const timelineObj = value;
            const expectedProperties = [
                'date_assigned',
                'date_due',
                // 'date_updated', handled automatically by us
            ];

            for (const property of expectedProperties) {
                // whoa, the in operator almost works like python ;) (minus the whole iterating thing)
                if (!(property in timelineObj)) {
                    throw new Error(
                        `timeline obj does NOT contain all required fields`
                    );
                }
            }
        }

        // Validate User Exists and record project_id, it should ultimately match project ID
        if (key === 'user_id' && value !== null) {
            const user = await UserService.getUserById(value);
            if (Boolean(user) !== true)
                throw new Error(`user not found with id:${value}`);

            if (requestedProjectId) {
                // have we already recieved project information?
                // if so, make sure request project_ID matches this user's
                if (requestedProjectId !== user.project_id)
                    throw new Error(
                        `user is not assigned to project ${requestedProjectId}`
                    );
            } else {
                // we haven't seen project information yet, so let's cache it
                requestedProjectId = user.project_id.toString();
            }
        }

        if (key === 'project_id' && value !== null) {
            const project = await ProjectService.getProjectById(value);
            const project_id = value;
            if (Boolean(project) !== true)
                throw new Error(`project not found with id:${value}`);

            if (requestedProjectId) {
                // we already have a cached project ID for this request from user
                // check if it matches the project_id here
                if (requestedProjectId !== project_id)
                    throw new Error(
                        `project id does not match user's assigned project of ${requestedProjectId}`
                    );
            } else {
                // we haven't seen project information, so cache it
                requestedProjectId = project_id;
            }
        }
    }

    // apply state validation, only tasks with 'status' == 'assigned' can adjust everything
    if (currentState !== null && currentState.status !== 'assigned') {
        // check extracted properties to see if user requested changes in any of these
        const invalidProperties = [
            //'id', // assigned by db
            'name',
            'details',
            'priority',
            // 'status', can always be changed
            'timeline',
            'user_id',
            'project_id',
        ];
        for (const item of extractedItems) {
            const [key, value] = Object.entries(item)[0];

            if (invalidProperties.includes(key) && value !== null) {
                throw new Error(
                    `only tasks with 'status' == 'assigned' adjust ${key}`
                );
            }
        }
    }

    // finally, clean up the finalized object and send back to callee
    const cleanObj = extractedItems.reduce((newRow, extractedItem) => {
        return Object.assign(newRow, extractedItem);
    }, {});

    // strip out NULL values that shouldn't be in the object (minus timeline)
    Object.keys(cleanObj).forEach((key) => {
        if (cleanObj[key] === null || cleanObj[key] === undefined)
            delete cleanObj[key]; // strip it
    });

    // add in timeline if it's null
    if (cleanObj.timeline === null)
        cleanObj.timeline = {
            date_assigned: null,
            date_due: null,
            date_updated: null,
        };

    return cleanObj;
};

// No special checks required by any assignment, just return as-is
const getAllTasks = async () => await SharedService.all(Task);

/* Get Task by ID
    There should be property which represents the user assigned to the task
        It should include the user's _id, first, last, isActive, etc
    There should be a property represents the project the task is associated to
        It should only include the _id of the project and name of the project
*/
const getTaskById = async (id) => {
    const task = await SharedService.get(Task, id, [
        ['user_id', ''],
        ['project_id', '-description -repository -manager_id'],
    ]);

    // send the matched item if found in DB
    if (!task) {
        // does not exist in the DB (or bad input)
        throw new Error(`task not found with id:${id}`);
    } else {
        // we got something valid from DB! convert into object
        return task.toObject();
    }
};

const createTask = async (request) => {
    // Make sure the parameters of the new object are all valid
    const cleanObj = await validateRequest(request);

    // Attempt to create the task
    cleanObj.timeline.date_updated = new Date().toLocaleDateString();
    const createdObject = await SharedService.create(Task, cleanObj);
    return createdObject.toObject();
};

const updateTask = async (req) => {
    // check id can be parsed at all
    if (!req.params.id) throw new Error(`task id is required`);

    // check if we have an entry for this id
    const taskObj = await SharedService.get(Task, req.params.id);

    // doesn't exist!
    if (!taskObj) {
        throw new Error(`task with id:${req.params.id} not found`);
    }

    // finally validate the transaction (assuming task didn't exist in db)
    // we'll simulate, because we're mocking a DB, we could also adjust validation
    // to include a different set of properties instead
    const cleanObj = await validateRequest(req, taskObj);

    // Attempt to do the update in the DB (ensures only valid properties are updated)
    for (const [key, value] of Object.entries(cleanObj)) {
        if (value !== null) taskObj[key] = value;
    }
    // finally update the timestamp
    taskObj.timeline.date_updated = new Date().toLocaleDateString();

    // do the update & return!
    await taskObj.save();
    return taskObj.toObject();
};

const removeTask = async (req) => {
    // check id can be parsed at all
    if (!req.params.id) throw new Error(`task id is required`);

    // check if we have an entry for this id
    const taskObj = await SharedService.get(Task, req.params.id);

    // doesn't exist!
    if (!taskObj) {
        throw new Error(`task with id:${req.params.id} not found`);
    }

    // Delete away if we're valid
    await taskObj.delete();
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    removeTask,

    getTaskStatusEnum,
    getTaskPriorityEnum,
};
