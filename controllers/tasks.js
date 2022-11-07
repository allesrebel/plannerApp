const ProjectService = require('../services/project');
const TaskService = require('../services/task');
const UserService = require('../services/user');

/* GET tasks listing. */
const getTasks = async (_, res) => {
    res.json(await TaskService.getAllTasks());
};

/* GET task by id. 
    There should be property which represents the user assigned to the task
        It should include the user's _id, first, last, isActive, etc
    There should be a property represents the project the task is associated to
        It should only include the _id of the project and name of the project
*/
const getTaskById = async (req, res) => {
    try {
        const requestedId = req.params.id;
        const task = await TaskService.getTaskById(requestedId, [
            ['user_id', ''],
            ['project_id', '-description -repository -manager_id'],
        ]);
        // send the matched item if found in DB
        if (!task) {
            // does not exist in the DB (or bad input)
            res.status(404).json({ message: 'resource not found' });
        } else {
            // we got something valid from DB! convert into object
            const TaskObj = task.toObject();
            res.json(TaskObj);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: `${error}` });
    }
};

// Validate that the request contains a valid
// task object (including validation rules)
// Probably should refactor this from here and project's controller
const validateTask = async (req, currentState = null) => {
    // request status, while we go through and validate everything
    let validRequest = true;

    // validate that we actually have a request
    if (Object.keys(req.body).length === 0) validRequest = false;

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

    // This is where we would check if all the items are here & valid
    for (const item of extractedItems) {
        // check for required properties!
        // for now, the only required properties is name, let user do updates to fill everything else out
        const [key, value] = Object.entries(item)[0];
        // note, we only check for existence IF we don't a current state saved in the DB
        if (currentState === null) {
            if (key === 'name' && value === null) validRequest = false;
            if (key === 'status' && value === null) validRequest = false;
            if (key === 'priority' && value === null) validRequest = false;
        }

        // validate properties passed in

        // perform validation on priority
        if (key === 'priority' && value !== null) {
            if (!['low', 'medium', 'high'].includes(value))
                validRequest = false;
        }

        // perform validation on status
        if (key === 'status' && value !== null) {
            if (
                !['assigned', 'in progress', 'in review', 'completed'].includes(
                    value
                )
            )
                validRequest = false;
        }

        // perform validation on timeline
        if (key === 'timeline' && value !== null) {
            // Note: value is actually a full on Javascript Object, with properties and values
            const timelineObj = value;
            const expectedProperties = [
                'date_assigned',
                'date_due',
                'date_updated',
            ];

            for (const property of expectedProperties) {
                // whoa, the in operator almost works like python ;) (minus the whole iterating thing)
                if (!(property in timelineObj)) {
                    validRequest = false;
                    break;
                }
            }
        }

        if (key === 'user_id' && value !== null) {
            if (Boolean(await UserService.getUserById(value)) !== true)
                validRequest = false;
        }

        if (key === 'project_id' && value !== null) {
            if (Boolean(await ProjectService.getProjectById(value)) !== true)
                validRequest = false;
        }

        // if we hit an invalid request early, we can exit early
        if (validRequest === false) break;
    }

    // apply state validation, only tasks with 'status' == 'assigned' can adjust everything
    if (
        validRequest &&
        currentState !== null &&
        currentState.status !== 'assigned'
    ) {
        // check extracted properties to see if user requested changes in any of these
        const invalidproperties = [
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

            if (key in invalidproperties && value !== null) {
                validRequest = false;
                break;
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

    return { validRequest, cleanObj };
};

/* POST task - create a task */
const createTask = async (req, res) => {
    // Make sure the parameters of the new object are all valid
    const { validRequest, cleanObj } = await validateTask(req);

    // attempt to insert into database if the request looks good
    try {
        // based on request status, return error or success w/ new item index
        if (!validRequest) {
            // invalid request, (name issue or bad input)
            res.status(400).json({ message: 'bad request' });
        } else {
            // we got something valid from DB, assuming could insert, got new id
            // we'll adjust the timestamp of the
            cleanObj.timeline.date_updated = new Date().toLocaleDateString();
            const result = await TaskService.createTask(cleanObj);
            res.json(result);
        }
    } catch (error) {
        res.status(500).json({ message: `${error}` });
    }
};

/* PUT task - update a task by id 
    A task (name, detail and timeline object) is only able to be updated as long as the status is "assigned".  Status can always be updated.
*/
const updateTask = async (req, res) => {
    // keep track of the request as we go
    let validRequest = true;

    // check id can be parsed at all
    if (!req.params.id) validRequest = false;

    // check if we have an entry for this id
    const taskObj = await TaskService.getTaskById(req.params.id);

    // doesn't exist!
    if (!taskObj) {
        validRequest = false;
    }

    // finally validate the transaction (assuming task didn't exist in db)
    // we'll simulate, because we're mocking a DB, we could also adjust validation
    // to include a different set of properties instead
    const results = await validateTask(req, taskObj);
    if (!results.validRequest) validRequest = false;
    const cleanObj = results.cleanObj;

    try {
        if (!validRequest) {
            // does not exist in the DB (or bad input)
            res.status(400).json({ message: 'unable to perform update' });
        } else {
            // Attempt to do the update in the DB (ensures only valid properties are updated)
            for (const [key, value] of Object.entries(cleanObj)) {
                if (value !== null) taskObj[key] = value;
            }
            // finally update the timestamp
            taskObj.timeline.date_updated = new Date().toLocaleDateString();
            // do the update!
            const result = await taskObj.save();
            res.json(result);
        }
    } catch (error) {
        res.status(500).json({ message: `${error}` });
    }
};

/* DELETE task - delete a task by ID */
const deleteTask = async (req, res) => {
    // keep track of the request as we go
    let validRequest = true;

    // check id can be parsed at all
    if (!req.params.id) validRequest = false;

    try {
        // check if we have an entry for this id
        const taskObj = await TaskService.getTaskById(req.params.id);

        // doesn't exist!
        if (!taskObj) {
            validRequest = false;
        }

        // Delete away if we're valid
        if (validRequest) {
            await taskObj.delete();
            res.json({ message: `task ${req.params.id} deleted` });
        } else {
            res.status(400).json({ message: 'invalid request' });
        }
    } catch (error) {
        res.status(500).json({ message: `${error}` });
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
};
