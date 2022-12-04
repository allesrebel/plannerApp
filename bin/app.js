// External packages
const express = require('express');

// Local Requires
require('./database'); // enable mongo database connection
const indexRouter = require('../api/routes/index');
const projectsRouter = require('../api/routes/projects');
const tasksRouter = require('../api/routes/tasks');
const usersRouter = require('../api/routes/users');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', indexRouter);
app.use('/projects', projectsRouter);
app.use('/tasks', tasksRouter);
app.use('/users', usersRouter);

module.exports = app;
