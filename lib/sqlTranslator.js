'use strict';
const Querier = require('./querier');
const Inserter = require('./inserter');
const Updater = require('./updater');
const Deleter = require('./deleter');

class SqlTranslator {
    constructor() {
        this.tag = 'SqlTranslator';
        this.defaultOption = {
            alisa: {},
            extData: {},
        }
        //模式
        this.pattern = {
            'insert': 'INSERT INTO Table (Params) Values (Value)',
            'query': 'SELECT * FROM Table Where Params=@Params',
            'update': 'UPDATE Table Set Params=@Params WHERE Params=@Params',
            'del': 'DELETE Table Where Params=@Params',
        }
    }
    query(sql, params, options) {
        if (params.constructor === Array) {
            return new Inserter(sql, params, options).getSql();
        } else {
            return new Querier(sql, params, options).getSql();
        }
    }
    // 关联查询
    linkedQuery(join,field,option){
        return new Querier().getSql3(join,field,option);
    }
    execute(sql, params, options) {
        return new Querier(sql, params, options).getSql();
    }
    insert(sql, params, options) {
      return new Inserter(sql,params,options).getSql();
    }
    parameterInsert(sql,params,options) {
        return new Inserter(sql,params,options).getSql2();
    };
    update(sql,params,options) {
        return new Updater(sql,params,options).getSql();
    }
    parameterUpdate(sql,params,options) {
        return new Updater(sql,params,options).getSql2();
    }
    delete(sql,params,options) {
        return new Deleter(sql,params,options).getSql();
    }

}

module.exports = new SqlTranslator();