const SqlBuilder = require('./sqlBuilder');

class Deleter extends SqlBuilder {
  constructor(sql, params, options) {
    super();
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
    const sqlParamsArray = me.sql.match(/[@]{1}[a-zA-Z0-9_-~!#$%^&*?\/\+]+/gim);
    if (sqlParamsArray !== null) {
      // 循环sql语句中的@内容，然后替换掉
      for(let x of sqlParamsArray) {
          const key = x.replace('@','');
          if(me.params.hasOwnProperty(key)) {
              const value = me.getValue(key, me.params[key]);
              me.sql = me.sql.replace(new RegExp('(' + x + ')' + '([^a-zA-Z0-9]{1}|$)', "igm"), value + '$2');
          }
      }
  }
  if(global.isDebug){
    console.log(me.sql);
  }
  return me.sql;
  };
  getSql2() {

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
};

module.exports = Deleter;