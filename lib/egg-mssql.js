'use strict';
// todo:1.兼容多用户管理，2.兼容orm
const assert = require('assert');
const sql = require('mssql');
const sqlTranslator = require('./sqlTranslator');
// 统一处理
sql.Request.prototype.asyncQuery = async function (sql, params, orderParams) {
  let sql_text = await sqlTranslator.query(sql, params, orderParams);
  let result = await this.query(sql_text)
  result['sql'] = sql_text
  return result
}
// 查询处理
sql.Request.prototype.asyncExecute = async function(sql,params,orderParams) {
  let sql_text = await sqlTranslator.execute(sql, params, orderParams);
  let result = await this.query(sql_text)
  result['sql'] = sql_text
  return result
}
// 插入数据处理
sql.Request.prototype.asyncInsert = async function (sql, params, orderParams) {
  let sql_text = await sqlTranslator.insert(sql, params, orderParams);
  let result = await this.batch(sql_text);
  result['sql'] = sql_text
  return result
}
// 传参插入
sql.Request.prototype.parameterInsert = async function(sql,params,orderParams) {
  let sql_text = await sqlTranslator.parameterInsert(sql,params,orderParams)
  let result = await this.batch(sql_text);
  result['sql'] = sql_text
  return result
}
// 对一些特殊的sql语句的处理
sql.Request.prototype.asyncBatch = async function (sql, params, orderParams) {
  let sql_text = await sqlTranslator.query(sql, params, orderParams);
  let result = this.batch(sqlTranslator.execute(sql, params, orderParams));
  result['sql'] = sql_text
  return result;
}
// 更新处理
sql.Request.prototype.asyncUpdate = async function (sql, params, orderParams) {
  let sql_text = await sqlTranslator.update(sql, params, orderParams);
  let result = await this.batch(sql_text);
  result['sql'] = sql_text
  return result
}
// 传参更新
sql.Request.prototype.parameterUpdate = async function(tableName,params,condition) {
  let sql_text = await sqlTranslator.parameterUpdate(tableName,params,condition);
  let result = await this.batch(sql_text);
  result['sql'] = sql_text;
  return result;
}
// 删除处理
sql.Request.prototype.asyncDelete = async function (sql, params, orderParams) {
  let sql_text = await sqlTranslator.delete(sql, params, orderParams);
  let result = await this.batch(sql_text);
  result['sql'] = sql_text
  return result
}
// 关联查询
sql.Request.prototype.linkedQuery = async function(sql,params,orderParams){
  let sql_text = await sqlTranslator.linkedQuery(sql,params,orderParams);
  let result = await this.batch(sql_text);
  result['sql'] = sql_text
  return result
}
// 事务处理
sql.Transaction.prototype.asyncBegin= function(isolationLevel, callback) {
  if (isolationLevel instanceof Function) {
    callback = isolationLevel
    isolationLevel = undefined
  }
  return new Promise((resolve, reject) => {
    this._begin(isolationLevel, async err => {
      if (err) return reject(err)
      this.emit('begin')
      // debug('tran: begin ok')
      const result = await callback(err);
      resolve(result);
    })
  })
}

module.exports = app => {
  if (!app.mssql) {
    // 这里进行多进程增强模型
    // 第一个参数是只挂载到app的哪个字段上
    // 第二个参数 createClient 接受两个参数(config, app)，并返回一个 mssql 的实例
    app.addSingleton('mssql', createClient);
  }
};
async function createClient(config, app) {
  // 匹配参数是否正确，并且把参数进行替换
  assert(config.server && config.user && config.password && config.server && config.database && config.port, `[egg-mssql] 'host: ${config.server}', 'port: ${config.port}', 'user: ${config.user}', 'database: ${config.database}' are required on config`);
  const pool = new sql.ConnectionPool(config);
  const client = await pool.connect(config);
  pool.on('error', err => {
    app.coreLogger.error('mssqlpool', err);
  });
  sql.on('error', err => {
    app.coreLogger.error('mssqlglobal', err);
  })
  return client;
}