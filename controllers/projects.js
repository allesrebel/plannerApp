const ProjectService = require('../services/project');

/* GET all projects listing w/ partial match search */
const getProjects = async (req, res) => {
    // check for the 'name' query params
    const projects = await ProjectService.getAllProjects();

    // Depending on if there's a search param or not, we filter the result
    if (req.query.name) {
        // perform partial search based on name given via search param
        const searchResults = projects.filter((project) => {
            return project.name
                .toLowerCase()
                .includes(req.query.name.toLowerCase());
        });

        // return the filtered results
        res.json(searchResults);
    } else {
        // return all the projects
        res.json(projects);
    }
};

/* GET project by id. */
const getProjectById = async (req, res) => {
    const requestedId = req.params.id;
    try {
        const project = await ProjectService.getProjectById(requestedId);
        // send the matched item if found in DB
        if (!project) {
            // does not exist in the DB (or bad input)
            res.status(404).json({ message: 'resource not found' });
        } else {
            // we got something valid from DB! convert into object
            const projectObj = project.toObject();
            // before giving result to user
            // add count of user_ids and task_ids as requested by assignment (for this request only)
            const taskCount = projectObj.task_ids.length;
            const userCount = projectObj.user_ids.length;
            projectObj.userCount = userCount;
            projectObj.taskCount = taskCount;
            res.json(projectObj);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'not valid ObjectID given' });
    }
};

const validateProject = (req) => {
    // request status, while we go through and validate everything
    let validRequest = true;

    // validate that we actually have a request
    if (Object.keys(req.body).length === 0) validRequest = false;

    // validate the body of the request, + strip out un-needed fields
    const fields = [
        // 'id', gets assigned by 'database'
        'name',
        'description',
        'repository',
        'manager_id',
        'task_ids',
        'user_ids',
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
        // for now, the only required fields is name
        const [key, value] = Object.entries(item)[0];
        if (key === 'name' && value === null) validRequest = false;

        // validate fields!
        // perform validation on ids, if they exist
        if (key === 'name' && value !== null) {
            // check if name exists at all in db
            // simulating w/ search
            const projectNameMatches = appDatabase.projects.filter(
                (project) => {
                    return project.name === value;
                }
            );
            if (projectNameMatches.length !== 0) validRequest = false;
        }

        if (key === 'manager_id' && value !== null) {
            // validate the ID via emulated db call
            const userMatches = appDatabase.users.filter((user) => {
                return user.id === parseInt(value);
            });

            // we couldn't look up the manager, mark request as invalid
            if (userMatches.length === 0) validRequest = false;
        }

        // perform validation on ids, if they exist
        if (key === 'task_ids' && value !== null) {
            // validate the IDs, make sure the set of ids is valid
            const matchedTaskIds = new Set();

            // rename value to something human readable
            const ids = value;

            for (const id of ids) {
                // cast to int
                const parsedId = parseInt(id);

                // simulate a look up
                const taskMatches = appDatabase.tasks.filter((task) => {
                    return task.id === parsedId;
                });
                // if we have any missing IDs, already invalid
                if (taskMatches.length === 0) {
                    validRequest = false;
                    break;
                }
                // add to set of matched IDs
                matchedTaskIds.add(taskMatches[0].id);
            }

            // check if set length === size of ids (else input malformed)
            if (ids.length !== matchedTaskIds.length) validRequest = false;
        }

        // perform validation on ids, if they exist
        if (key === 'user_ids' && value !== null) {
            // validate the IDs, make sure the set of ids is valid
            const matchedUserIds = new Set();

            // rename value to something human readable
            const ids = value;

            for (const id of ids) {
                // cast to int
                const parsedId = parseInt(id);

                // simulate a look up
                const userMatches = appDatabase.users.filter((user) => {
                    return user.id === parsedId;
                });
                // if we have any missing IDs, already invalid
                if (userMatches.length === 0) {
                    validRequest = false;
                    break;
                }
                // add to set of matched IDs
                matchedUserIds.add(userMatches[0].id);
            }

            // check if set length === size of ids (else input malformed)
            if (ids.length !== matchedUserIds.size) validRequest = false;
        }

        // if we hit an invalid request early, we can exit early
        if (validRequest === false) break;
    }

    const cleanObj = extractedItems.reduce((newRow, extractedItem) => {
        return Object.assign(newRow, extractedItem);
    }, {});
    return { validRequest, cleanObj };
};

/* POST project - create a project if unique name */
const createProject = async (req, res) => {
    // Make sure the parameters of the new object are all valid
    const { validRequest, cleanObj } = validateProject(req);

    // attempt to insert into database
    // simulate by adding 1 to largest mock id, always successful!
    const largestId = appDatabase.projects.reduce((acc, project) => {
        return Math.max(acc, project.id);
    }, 0);
    cleanObj.id = largestId + 1;

    // based on request status, return error or success w/ new item index
    if (validRequest === false) {
        // invalid request, (name issue or bad input)
        res.status(400).json({ message: 'bad request' });
    } else {
        // we got something valid from DB, assuming could insert, got new id
        appDatabase.projects.push(cleanObj);
        res.json(cleanObj);
    }
};

/* PUT project - update a project by id if unique name */
const updateProject = async (req, res) => {
    // keep track of the request as we go
    let validRequest = true;

    // check id can be parsed at all
    if (isNaN(parseInt(req.params.id)) === true) validRequest = false;

    // validate name exists
    if (req.body.name === null) validRequest = false;

    // check if we have an entry for this id
    // simulate a DB lookup via id w/ search
    const idSearchResults = appDatabase.projects.filter((project) => {
        return project.id === parseInt(req.params.id);
    });

    // doesn't exist!
    if (idSearchResults.length !== 1) {
        // does not exist in the DB (or bad input)
        validRequest = false;
    } else {
        //Does exist!

        // check for unique name, only if req.body has different
        if (req.body.name !== idSearchResults[0].name) {
            // simulate a DB lookup via id w/ search
            const searchResults = appDatabase.projects.filter((project) => {
                return project.name === req.body.name;
            });

            if (searchResults.length !== 0) validRequest = false;
        }
    }

    // finally validate the transaction (assuming project didn't exist in db)
    // we'll simulate, because we're mocking a DB, we could also adjust validation
    // to include a different set of fields instead
    delete appDatabase.projects[
        appDatabase.projects.indexOf(idSearchResults[0])
    ];
    const results = validateProject(req);
    if (results.validRequest !== true) validRequest = false;
    const cleanObj = results.cleanObj;

    if (validRequest !== true) {
        // perform the update (always success in this mock)
        // does not exist in the DB (or bad input)
        res.status(404).json({ message: 'resource not found' });
    } else {
        // we got something valid from DB (Assume we had a transaction for all this)
        const newObj = Object.assign(idSearchResults[0], cleanObj);
        // and place back into array for fun (into DB)
        appDatabase.projects.push(newObj);
        res.json(newObj);
    }
};

module.exports = { getProjects, getProjectById, createProject, updateProject };
