const router = require('express').Router();

const ProjectsController = require('../controllers/projects');

/* GET all projects listing w/ partial match search */
router.get('/', ProjectsController.getProjects);

/* GET project by id. */
router.get('/:id', ProjectsController.getProjectById);

/* POST project - create a project if unique name */
router.post('/', ProjectsController.createProject);

/* PUT project - update a project by id if unique name */
router.put('/:id', ProjectsController.updateProject);

module.exports = router;
