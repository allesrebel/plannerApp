const router = require('express').Router();

const UsersController = require('../controllers/users');

/* GET users listing. */
router.get('/', UsersController.getUsers);

/* GET user by id. */
router.get('/:id', UsersController.getUserById);

/* PUT user - update a user by id 
    A user (name, detail and timeline object) is only able to be updated as long as the status is "assigned".  Status can always be updated.
*/
router.put('/:id', UsersController.updateUser);

module.exports = router;
