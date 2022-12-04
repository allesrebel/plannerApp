// Global Dependencies
const mongoose = require('mongoose');

// Connect to our MongoDB instance using config.json's credentials (Part 2.1)
const { username, password, dbName } = require('./config.json');
const uri = `mongodb+srv://${username}:${password}@cluster0.ve805be.mongodb.net/${dbName}?retryWrites=true&w=majority`;
mongoose.connect(uri);
