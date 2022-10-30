const express = require('express');
const router = express.Router();
const appDatabase = require('../database');

/* GET tasks listing. */
router.get('/', function (req, res, next) {
    // note we will filter out nulls, due to our mock DB implementation
    const filtered = appDatabase.tasks.filter((element) => element !== null);
    res.json(filtered);
});

/* GET task by id. */
router.get('/:id', function (req, res, next) {
    // emulate check if database has the task via search
    const requestedId = parseInt(req.params.id);
    const searchResults = appDatabase.tasks.filter((task) => {
        return task.id === requestedId;
    });

    // send the matched item if found in DB
    if (searchResults.length !== 1) {
        // does not exist in the DB (or bad input)
        res.status(404).json({ message: 'resource not found' });
    } else {
        // we got something valid from DB
        res.json(searchResults.at(0));
    }
});

// Validate that the request contains a valid
// task object (including validation rules)
//
const validateTask = (req, currentState = null) => {
    // request status, while we go through and validate everything
    let validRequest = true;

    // validate that we actually have a request
    if (Object.keys(req.body).length === 0) validRequest = false;

    // validate the body of the request, + strip out un-needed fields
    const fields = [
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
    const extractedItems = fields.map((field) => {
        const newObj = {};
        if (reqObj.hasOwnProperty(field)) {
            newObj[field] = reqObj[field];
        } else {
            newObj[field] = null;
        }
        return newObj;
    });

    // This is where we would check if all the items are here & valid
    for (const item of extractedItems) {
        // check for required fields!
        // for now, the only required fields is name, let user do updates to fill everything else out
        const [key, value] = Object.entries(item)[0];
        // note, we only check for existence IF we don't a current state saved in the DB
        if (currentState === null) {
            if (key === 'name' && value === null) validRequest = false;
            if (key === 'status' && value === null) validRequest = false;
            if (key === 'priority' && value === null) validRequest = false;
        }

        // validate fields passed in

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
            const expectedKeyValuePairs = [
                'date_assigned',
                'date_due',
                'date_updated',
            ];
            for (const item in expectedKeyValuePairs) {
                if (!(item in value)) validRequest = false;
                break;
            }
            //TODO: do basic checking of timestamps
        }

        if (key === 'user_id' && value !== null) {
            // validate the ID via emulated db call
            const userMatches = appDatabase.users.filter((user) => {
                return user.id === parseInt(value);
            });

            // we couldn't look up the user, mark request as invalid
            if (userMatches.length === 0) validRequest = false;
        }

        if (key === 'project_id' && value !== null) {
            // validate the ID via emulated db call
            const projectMatches = appDatabase.projects.filter((project) => {
                return project.id === parseInt(value);
            });

            // we couldn't look up the project, mark request as invalid
            if (projectMatches.length === 0) validRequest = false;
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
        // check extracted fields to see if user requested changes in any of these
        const invalidFields = [
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

            if (key in invalidFields && value !== null) {
                validRequest = false;
                break;
            }
        }
    }

    // finally, clean up the finalized object and send back to callee
    const cleanObj = extractedItems.reduce((newRow, extractedItem) => {
        return Object.assign(newRow, extractedItem);
    }, {});

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
router.post('/', function (req, res, next) {
    // Make sure the parameters of the new object are all valid
    const { validRequest, cleanObj } = validateTask(req);

    // attempt to insert into database
    // simulate by adding 1 to largest mock id, always successful!
    const largestId = appDatabase.tasks.reduce((acc, task) => {
        return Math.max(acc, task.id);
    }, 0);
    cleanObj.id = largestId + 1;

    // based on request status, return error or success w/ new item index
    if (validRequest === false) {
        // invalid request, (name issue or bad input)
        res.status(400).json({ message: 'bad request' });
    } else {
        // we got something valid from DB, assuming could insert, got new id
        // we'll adjust the timestamp of the
        cleanObj.timeline.date_updated = new Date().toLocaleDateString();
        appDatabase.tasks.push(cleanObj);
        res.json(cleanObj);
    }
});

/* PUT task - update a task by id 
    A task (name, detail and timeline object) is only able to be updated as long as the status is "assigned".  Status can always be updated.
*/
router.put('/:id', function (req, res, next) {
    // keep track of the request as we go
    let validRequest = true;

    // check id can be parsed at all
    if (isNaN(parseInt(req.params.id)) === true) validRequest = false;

    // check if we have an entry for this id
    // simulate a DB lookup via id w/ search
    const idSearchResults = appDatabase.tasks.filter((task) => {
        return task.id === parseInt(req.params.id);
    });

    // doesn't exist!
    if (idSearchResults.length !== 1) {
        // does not exist in the DB (or bad input)
        validRequest = false;
    }

    // finally validate the transaction (assuming task didn't exist in db)
    // we'll simulate, because we're mocking a DB, we could also adjust validation
    // to include a different set of fields instead
    const results = validateTask(req, idSearchResults[0]);
    if (results.validRequest !== true) validRequest = false;
    const cleanObj = results.cleanObj;

    if (validRequest !== true) {
        // perform the update (always success in this mock)
        // does not exist in the DB (or bad input)
        res.status(400).json({ message: 'unable to perform update' });
    } else {
        // we got something valid from DB
        // we'll simulate an update by directly applying only the changed fields
        const taskIndex = appDatabase.tasks.indexOf(idSearchResults[0]);
        for (const [key, value] of Object.entries(cleanObj)) {
            if (value !== null) appDatabase.tasks.at(taskIndex)[key] = value;
        }
        // finally update the timestamp
        appDatabase.tasks.at(taskIndex).timeline.date_updated =
            new Date().toLocaleDateString();
        res.json(appDatabase.tasks.at(taskIndex));
    }
});

/* DELETE task - delete a task by ID */
router.delete('/:id', function (req, res, next) {
    // simulate a look up by ID
    const taskMatches = appDatabase.tasks.filter((task) => {
        return task.id === parseInt(req.params.id);
    });

    // we couldn't look up the id
    if (taskMatches.length === 0) {
        // invalid request, (name issue or bad input)
        res.status(500).json({ message: 'resource not found' });
    } else {
        // we got something valid from DB, assuming could delete
        delete appDatabase.tasks[appDatabase.tasks.indexOf(taskMatches[0])];
        res.json({ message: `task ${req.params.id} deleted` });
    }
});

module.exports = router;
