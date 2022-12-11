const SharedService = require('./shared');
const User = require('../models/user');

const getAllUsers = async (req) => {
    // collect all the users
    const users = await SharedService.all(User);

    // check for the 'status' query params
    if (Boolean(req.query.active)) {
        // validate that query is either True or False
        // assumes true if not explicitly 'false'
        let filterStatus = true;
        if (req.query.active === 'false') {
            filterStatus = false;
        }

        // perform partial search based on status given
        const searchResults = users.filter((user) => {
            return user.active === filterStatus;
        });

        // return the filtered results
        return searchResults;
    } else {
        // return all the users
        return users;
    }
};

const getUserById = async (requestedId) => {
    const user = await SharedService.get(User, requestedId);
    // send the matched item if found in DB
    if (!user) {
        // does not exist in the DB (or bad input)
        throw new Error(`user not found with id:${requestedId}`);
    } else {
        return user.toObject();
    }
};

const updateUser = async (req) => {
    // check id can be parsed at all
    if (!req.params.id) throw new Error(`user id is required`);

    // check if we have an entry for this id
    const user = await SharedService.get(User, req.params.id);

    // doesn't exist!
    if (!user) {
        // does not exist in the DB (or bad input)
        throw new Error(`user with id:${req.params.id} not found`);
    }

    // the only property that can be updated via API is active, ignore other properties
    if (req.body.active === null)
        throw new Error(`missing active property (the only one updateable)`);

    // we got something valid from DB, perform update
    user.active = req.body.active;

    // save and return
    await user.save();
    return user.toObject();
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
};
