const SqlBuilder = require('./sqlBuilder');

class Updater extends SqlBuilder {
  constructor(sql, params, options) {
    super();
    this.table = sql;
    this.sql = sql;
    this.options = Object.assign(this.defaultOption, options);
    this.params = params;
  };
  getSql() {
    const me = this;
    me.params = this.replaceCapital(me.params)
    if(!me.params) {
        return me.sql;
    };
    // 判断是否有排序
    if(this.options.hasOwnProperty('OrderBy')) {
      this.Order();
  }
    // 把所有的@符号后面的内容提取出来
    const sqlParamsArray = me.sql.match(/[@]{1}[a-zA-Z0-9]+/gim);
    if (sqlParamsArray !== null) {
      // 循环sql语句中的@内容，然后替换掉
      for(let x of sqlParamsArray) {
          const key = x.replace('@','');
          if(me.params.hasOwnProperty(key)) {
              const value = me.getValue(key, me.params[key]);
              me.sql = me.sql.replace(new RegExp('(' + x + ')' + '(.*){1}', "igm"), value + '$2');
          }
      }
  }
  return me.sql;
  };
  getSql2() {
    // 判断表名是否存在[]符号
    const patt = /\[(.*)\]/;
    let sql_text
    if(patt.test(this.table)) {
        sql_text = `update ${this.table} set `
    } else {
        sql_text = `update [${this.table}] set `
    }
    for(let item in this.params.set) {
        const value = this.getValue2(this.params.set[item],item)
        sql_text = sql_text + value + ','
    }
    sql_text = sql_text.substr(0,sql_text.length-1)
    if(this.params.hasOwnProperty('where')) {
        sql_text = sql_text + ' where '
        sql_text = this.getCondition(sql_text);
    }
    return sql_text
  };

  // 把数组转化为字符串并且将字符串进行处理
  getValue(params, value) {
    let result = void 0;
    if(value == null || value === undefined) {
        value = ''
    }
    if (value.constructor === Array) {
        result = "";
        value.forEach((x, index) => {
        result = result + `,'${x}'`
        });
        result = result.substr(1)
    } else {
        if(value.constructor === String){
            // 使用正则防止sql注入
            const patt = /\'/
            value = value + ''
            result = value.replace(/(\sand\s|\sor\s|\snot\s)/gim, ' ');
            result = result.replace(/(\sand\s|\sor\s|\snot\s)/gim, ' ');
            if(patt.test(value)) {
                result = `"${result}"`
            } else {
                result = `'${result}'`;
            }
        } else{
            result = value;
        }
    }
    return result;
  }

  // 把数组转化为字符串并且将字符串进行处理
  getValue2(value,key) {
    let result = void 0;
    if(value == null) {
        result = key + ' = ' + "''"
    } else {
        let values = value.toString();
        const patt = /\'/
        result = values.replace(/(\sand\s|\sor\s|\s*not\s)/igm, ' ')
        if(patt.test(values)) {
            result = key + ' = ' + `"${result}"`
        } else {
            result = key + ' = ' + `'${result}'`
        }
    }
    return result;
  }
  getCondition(sql_text) {
      if(this.params.where.hasOwnProperty('and') && this.params.where.hasOwnProperty('or')) {
          for(let item in this.params.where.and) {
              const value = this.getValue2(this.params.where.and[item],item)
            sql_text = sql_text + value + ' and '
          }
          sql_text = sql_text + '('
          for(let item_2 in this.params.where.or) {
            const value = this.getValue2(this.params.where.or[item_2],item_2)
            sql_text = sql_text + value + ' or '
          }
          sql_text = sql_text.substr(0,sql_text.length - 4) + ')'
      } else if(this.params.where.hasOwnProperty('and')) {
        for(let item in this.params.where.and) {
            const value = this.getValue2(this.params.where.and[item],item)
          sql_text = sql_text + value + ' and '
        }
        sql_text = sql_text.substr(0,sql_text.length - 5)
      } else if(this.params.where.hasOwnProperty('or')) {
        for(let item in this.params.where.or) {
            const value = this.getValue2(this.params.where.or[item],item)
          sql_text = sql_text + value + ' or '
        }
        sql_text = sql_text.substr(0,sql_text.length - 4)
      }
      return sql_text;
  }
};

module.exports = Updater;