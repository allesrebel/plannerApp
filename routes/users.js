const express = require('express');
const router = express.Router();
const appDatabase = require('../database');

/* GET users listing. */
router.get('/', function (req, res, next) {
    // check for the 'status' query params
    if (req.query.active) {
        // validate that query is either True or False
        // assumes true if not explictly false
        let filterStatus = true;
        if (req.query.active === 'false') {
            filterStatus = false;
        }

        // perform partial search based on status given
        const searchResults = appDatabase.users.filter((user) => {
            return user.active === filterStatus;
        });

        // return the results
        res.json(searchResults);
    } else {
        // list out all users, with filtering on nulls due to mock implementation
        const filtered = appDatabase.users.filter(
            (element) => element !== null
        );
        res.json(filtered);
    }
});

/* GET user by id. */
router.get('/:id', function (req, res, next) {
    // emulate check if database has the user via search
    const requestedId = parseInt(req.params.id);
    const searchResults = appDatabase.users.filter((user) => {
        return user.id === requestedId;
    });

    // send the matched item if found in DB
    if (searchResults.length !== 1) {
        // does not exist in the DB (or bad input)
        res.status(404).json({ message: 'resource not found' });
    } else {
        // we got something valid from DB
        res.json(searchResults.at(0));
    }
});

/* PUT user - update a user by id 
    A user (name, detail and timeline object) is only able to be updated as long as the status is "assigned".  Status can always be updated.
*/
router.put('/:id', function (req, res, next) {
    // keep track of the request as we go
    let validRequest = true;

    // check id can be parsed at all
    if (isNaN(parseInt(req.params.id)) === true) validRequest = false;

    // check if we have an entry for this id
    // simulate a DB lookup via id w/ search
    const idSearchResults = appDatabase.users.filter((user) => {
        return user.id === parseInt(req.params.id);
    });

    // doesn't exist!
    if (idSearchResults.length !== 1) {
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
        const indexOfUser = appDatabase.users.indexOf(idSearchResults[0]);
        appDatabase.users.at(indexOfUser).active = req.body.active;
        res.json(appDatabase.users.at(indexOfUser));
    }
});

module.exports = router;
