'use strict';
const mssql = require('./lib/egg-mssql');
module.exports = app => {
  if (app.config.mssql) mssql(app);
};