// External packages
const express = require('express');

// Local Requires
require('./database'); // enable mongo database connection
const indexRouter = require('./routes/index');
const projectsRouter = require('./routes/projects');
const tasksRouter = require('./routes/tasks');
const usersRouter = require('./routes/users');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', indexRouter);
app.use('/projects', projectsRouter);
app.use('/tasks', tasksRouter);
app.use('/users', usersRouter);

module.exports = app;
