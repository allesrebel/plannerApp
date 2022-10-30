const router = require('express').Router();

const TasksController = require('../controllers/tasks');

/* GET tasks listing. */
router.get('/', TasksController.getTasks);

/* GET task by id. */
router.get('/:id', TasksController.getTaskById);

/* POST task - create a task */
router.post('/', TasksController.createTask);

/* PUT task - update a task by id 
    A task (name, detail and timeline object) is only able to be updated as long as the status is "assigned".  Status can always be updated.
*/
router.put('/:id', TasksController.updateTask);

/* DELETE task - delete a task by ID */
router.delete('/:id', TasksController.deleteTask);

module.exports = router;
