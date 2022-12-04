const SharedService = require('./shared');
const User = require('../models/user');

const getAllUsers = async () => await SharedService.all(User);

const getUserById = async (id) => await SharedService.get(User, id);

const createUser = async (body) => await SharedService.create(User, body);

const removeUser = async (id) => await SharedService.remove(User, id);

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    removeUser,
};
