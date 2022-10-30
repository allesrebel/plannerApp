const UserService = require('../services/user');

/* GET users listing. */
const getUsers = async (req, res) => {
    // collect all the users
    const users = await UserService.getAllUsers();

    // check for the 'status' query params
    if (req.query.active) {
        // validate that query is either True or False
        // assumes true if not explicitly false
        let filterStatus = true;
        if (req.query.active === 'false') {
            filterStatus = false;
        }

        // perform partial search based on status given
        const searchResults = users.filter((user) => {
            return user.active === filterStatus;
        });

        // return the filtered results
        res.json(searchResults);
    } else {
        // return all the users
        res.json(users);
    }
};

/* GET user by id. */
const getUserById = async (req, res) => {
    const requestedId = req.params.id;
    try {
        const user = await UserService.getUserById(requestedId);
        // send the matched item if found in DB
        if (!user) {
            // does not exist in the DB (or bad input)
            res.status(404).json({ message: 'resource not found' });
        } else {
            // we got something valid from DB! convert into object
            const userObj = User.toObject();
            res.json(userObj);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'not valid ObjectID given' });
    }
};

/* PUT user - update a user by id 
    A user (name, detail and timeline object) is only able to be updated as long as the status is "assigned".  Status can always be updated.
*/
const updateUser = async (req, res) => {
    // keep track of the request as we go
    let validRequest = true;

    // check if we have an entry for this id
    // simulate a DB lookup via id w/ search
    const user = UserService.getUserById(validRequest);

    // doesn't exist!
    if (!user) {
        // does not exist in the DB (or bad input)
        validRequest = false;
    }

    // the only field that can be updated via API is active, ignore other fields
    if (req.body.active === null) validRequest = false;

    if (validRequest !== true) {
        // perform the update (always success in this mock)
        // does not exist in the DB (or bad input)
        res.status(400).json({ message: 'unable to perform update' });
    } else {
        // we got something valid from DB, perform update
        const indexOfUser = appDatabase.users.indexOf(user[0]);
        appDatabase.users.at(indexOfUser).active = req.body.active;
        res.json(appDatabase.users.at(indexOfUser));
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUser,
};
