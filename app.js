// External packages
const cookieParser = require('cookie-parser');
const express = require('express');
const http_errors = require('http-errors');
const logger = require('morgan');
const path = require('path');

// Local Requires (routers and controllers)
const indexRouter = require('./routes/index');
const projectsRouter = require('./routes/projects');
const tasksRouter = require('./routes/tasks');
const usersRouter = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware, pre-router
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// stuff, post router
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tasks', tasksRouter);
app.use('/projects', projectsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(http_errors(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;