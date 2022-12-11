const router = require('express').Router();

/* GET index listing. */
router.get('/', function (_, res) {
    res.json({
        available_json_apis: {
            projects: [
                'GET projects[?search]',
                'GET projects/:id',
                'POST projects',
                'PUT projects/:id',
            ],
            tasks: [
                'GET tasks',
                'GET tasks/enum_status',
                'GET tasks/enum_priority',
                'GET tasks/:id',
                'POST tasks',
                'PUT tasks/:id',
                'DELETE tasks/:id',
            ],
            users: ['GET users[?active]', 'GET users/:id', 'PUT users/:id'],
        },
    });
});

module.exports = router;
