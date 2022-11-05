const ProjectService = require('../services/project');
const TaskService = require('../services/task');
const UserService = require('../services/user');

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
    try {
        const requestedId = req.params.id;
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
        res.status(500).json({ message: `${error}` });
    }
};

const setValidationAndExists = async (Service, ids) => {
    var uniqueSetAndAllExist = true;

    // validate the IDs, make sure the set of ids is valid
    const matchedTaskIds = new Set();

    for (const id of ids) {
        // simulate a look up
        const lookupViaService = Boolean(await Service.getTaskById(id));

        // if we have any missing IDs, already invalid
        if (lookupViaService === false) {
            uniqueSetAndAllExist = false;
            break;
        }

        // add to set of matched IDs
        matchedTaskIds.add(id);
    }

    // check if set length === size of ids (else input malformed)
    if (ids.length !== matchedTaskIds.length) uniqueSetAndAllExist = false;

    return uniqueSetAndAllExist;
};

const validateProject = async (req, bypass_required_fields = false) => {
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
    for await (const item of extractedItems) {
        // early break if we've already failed some validation
        if (validRequest === false) break;

        // check for required fields!
        // for now, the only required fields is name
        const [key, value] = Object.entries(item)[0];
        if (
            key === 'name' &&
            value === null &&
            bypass_required_fields === false
        )
            validRequest = false;

        // validate across all the fields!
        if (
            key === 'name' &&
            value !== null &&
            bypass_required_fields === false
        ) {
            // check if name exists at all in DB, name is required to be unique
            if (!(await ProjectService.findProject({ name: value })) === true)
                // we matched on an existing project, so we're not unique!
                validRequest = false;
        }

        if (key === 'manager_id' && value !== null) {
            if (Boolean(await UserService.getUserById(value)) !== true)
                validRequest = false;
        }

        if (key === 'task_ids' && value !== null) {
            if ((await setValidationAndExists(TaskService, value)) !== true)
                validRequest = false;
        }

        // perform validation on ids, if they exist
        if (key === 'user_ids' && value !== null) {
            if ((await setValidationAndExists(UserService, value)) !== true)
                validRequest = false;
        }
    }

    const cleanObj = extractedItems.reduce((newRow, extractedItem) => {
        return Object.assign(newRow, extractedItem);
    }, {});

    // strip out NULL values that shouldn't be in the object
    Object.keys(cleanObj).forEach((key) => {
        if (cleanObj[key] === null || cleanObj[key] === undefined)
            delete cleanObj[key]; // strip it
    });

    return { validRequest, cleanObj };
};

/* POST project - create a project if unique name */
const createProject = async (req, res) => {
    // Make sure the parameters of the new object are all valid
    const { validRequest, cleanObj } = await validateProject(req);

    // attempt to insert into database
    try {
        if (!validRequest)
            res.status(400).json({ message: 'error validating body' });
        else {
            const obj = await ProjectService.createProject(cleanObj);
            res.json(obj);
        }
    } catch (error) {
        res.status(500).json({ message: `${error}` });
    }
};

/* PUT project - update a project by id if unique name */
const updateProject = async (req, res) => {
    // keep track of the request as we go
    let validRequest = true;

    // check id can be parsed at all
    if (!req.params.id) validRequest = false;

    // validate name exists (required field), but instead of checking
    // for uniquiness, we'll have the DB inforce this via index (if we find an obj)
    if (!req.body.name) validRequest = false;

    // check if we have an entry for this id
    const projectObj = await ProjectService.getProjectById(req.params.id);

    // did we actually find a project with this ID?
    if (!projectObj) {
        // does not exist in the DB (or bad input)
        validRequest = false;
    }

    // finally validate the transaction (everything else in body)
    const results = await validateProject(req, true);
    // Were the rest of the properties okay? (users, tasks, etc via validation)
    if (!results.validRequest) validRequest = false;
    // Grab the final updated project
    const cleanObj = results.cleanObj;

    try {
        if (!validRequest) {
            // does not exist in the DB (or bad input)
            res.status(400).json({ message: 'failed to validate request' });
        } else {
            //  let's try an update, we're good to go
            const result = await projectObj.updateOne(cleanObj);
            res.json(result);
        }
    } catch (error) {
        res.status(500).json({ message: `${error}` });
    }
};

module.exports = { getProjects, getProjectById, createProject, updateProject };
