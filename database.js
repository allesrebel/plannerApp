// load in mock data to play with
const appProjectsMockData = require('./mock_data/projects.json');
const appTasksMockData = require('./mock_data/tasks.json');
const appUsersMockData = require('./mock_data/users.json');

const appDatabase = { 
  'projects': appProjectsMockData,
  'users': appUsersMockData,
  'tasks': appTasksMockData
};

// export this data out to other functions
module.exports = appDatabase;
