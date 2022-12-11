const Project = require('../models/project');
const UserService = require('./user');
const SharedService = require('./shared');

// Validation Logic for Projects
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

const validateRequest = async (req, bypass_required_properties = false) => {
    // validate that we actually have a request
    if (Object.keys(req.body).length === 0)
        throw new Error(`input data is empty`);

    // validate the body of the request, + strip out un-needed properties
    const properties = [
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
    for await (const item of extractedItems) {
        // check for required properties!
        // for now, the only required properties is name
        const [key, value] = Object.entries(item)[0];
        if (
            key === 'name' &&
            value === null &&
            bypass_required_properties === false
        )
            throw new Error(`name field not found`);

        // validate across all the properties!
        if (
            key === 'name' &&
            value !== null &&
            bypass_required_properties === false
        ) {
            // check if name exists at all in DB, name is required to be unique
            if (await Project.findOne({ name: value }))
                // we matched on an existing project, so we're not unique!
                throw new Error(`project name not unique`);
        }

        if (key === 'manager_id' && value !== null) {
            if (Boolean(await UserService.getUserById(value)) !== true)
                throw new Error(`manager not found with id:${value}`);
        }

        if (key === 'task_ids' && value !== null) {
            if ((await setValidationAndExists(TaskService, value)) !== true)
                throw new Error(`task not found with id:${value}`);
        }

        // perform validation on ids, if they exist
        if (key === 'user_ids' && value !== null) {
            if ((await setValidationAndExists(UserService, value)) !== true)
                throw new Error(`user not found with id:${value}`);
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

    return cleanObj;
};

/*
 Simple, just grab all the projects!
 Filter the result on database side if there's any query parameter
 manager should be populated for results
*/
const getAllProjects = async (request) => {
    const projects = await SharedService.all(Project, [['manager_id', '']]);

    if (request.query.name) {
        // perform partial search based on name given via search param
        const search_results = projects.filter((project) => {
            return project.name
                .toLowerCase()
                .includes(request.query.name.toLowerCase());
        });
        return search_results;
    } else return projects;
};

/* get project by id. While maintaining HW Requirements
    Here's where we'll implement the logic specified by the assignment:
    There should be property which represents the manager of project
        + It should include the manager's _id, first, last, isActive, etc
    There should be a property represents all the tasks associated to the project
        + It should only include the _id of the task[,] name, and detail of the task (not the timeline object)
        was task name should be included too (typo? i think there's supposed to be',' 
        plus it  seems odd to have details but not task name)
*/
const getProjectById = async (id) => {
    // Use Shared service w/ Populate details to retreive the project
    const project = await SharedService.get(Project, id, [
        ['user_ids', ''], // required to produce user count, we'll do same as manager
        ['task_ids', '-timeline -status -priority -user_id -__v'],
        ['manager_id', ''],
    ]);

    // send the matched item if found in DB
    if (!project) {
        // does not exist in the DB (or bad input)
        throw new Error(`project not found with id:${id}`);
    } else {
        // we got something valid from DB! convert into object
        const projectObj = project.toObject();

        // clean up task_ids, removing the project_id property
        projectObj.tasks = [];
        for (const taskModelObj of project.task_ids) {
            const taskObj = taskModelObj.toObject();
            delete taskObj.project_id;
            projectObj.tasks.push(taskObj);
        }

        // add count of user_ids and task_ids as requested by assignment (for this request only)
        // this was required in HW1, wasn't sure to keep or not
        const taskCount = projectObj.task_ids.length;
        const userCount = projectObj.user_ids.length;
        delete projectObj.task_ids;
        delete projectObj.user_ids;
        projectObj.userCount = userCount;
        projectObj.taskCount = taskCount;
        return projectObj;
    }
};

// Processes the project given into a Database interaction
// returns the object itself (or error if something went wrong)
const createProject = async (request) => {
    // Make sure the parameters of the new object are all valid
    const cleanObj = await validateRequest(request);

    return await SharedService.create(Project, cleanObj);
};

// Processes the project given into a Database interaction
// returns the object itself (or error if something went wrong)
const updateProject = async (request) => {
    // check id can be parsed at all
    if (!request.params.id) throw new Error(`missing project id to update`);

    // check if we have an entry for this id
    const projectObj = await await SharedService.get(
        Project,
        request.params.id
    );

    // did we actually find a project with this ID?
    if (!projectObj) {
        // does not exist in the DB (or bad input)
        throw new Error(`project with id:${request.params.id} not found`);
    }

    // finally validate the transaction (everything else in body)
    const cleanObj = await validateRequest(request, true);

    // Attempt to do the update in the DB (ensures only valid properties are updated)
    for (const [key, value] of Object.entries(cleanObj)) {
        if (value !== null) projectObj[key] = value;
    }

    // Finally update the database entry and return
    await projectObj.save(); // will throw on errors

    // convert to javascript object
    return projectObj.toObject();
};

const removeProject = async (id) => await SharedService.remove(Project, id);

module.exports = {
    getAllProjects,
    getProjectById,
    createProject,
    removeProject,
    updateProject,
};
