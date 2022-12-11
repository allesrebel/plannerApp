const UserService = require('../services/user');

/* GET users listing. */
const getUsers = async (req, res) => {
    try {
        res.status(200).json(await UserService.getAllUsers(req));
    } catch (error) {
        res.status(500).json({ message: `${error}` });
    }
};

/* GET user by id. */
const getUserById = async (req, res) => {
    try {
        res.status(200).json(await UserService.getUserById(req.params.id));
    } catch (error) {
        res.status(500).json({ message: `${error}` });
    }
};

/* PUT user - update a user by id 
   Only allow active status changes, otherwise reject changes
*/
const updateUser = async (req, res) => {
    try {
        res.status(200).json(await UserService.updateUser(req));
    } catch (error) {
        res.status(500).json({ message: `${error}` });
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUser,
};
