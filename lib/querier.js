const SqlBuilder = require('./sqlBuilder');
class Querier extends SqlBuilder {
    constructor(sql, params, options) {
        // 继承父类的所有方法和属性
        super();
        this.sql = sql;
        // 将参数合并
        this.options = Object.assign(this.defaultOption, options)
        // 把对象的键进行转化成大写
        this.params = params;
    }
    getSql() {
        const me = this;
        me.params = this.replaceCapital(me.params)
        if(!me.params) {
            return me.sql;
        }
        // 判断是否有排序
        if(this.options.hasOwnProperty('OrderBy')) {
            this.Order();
        }
        if(this.options.hasOwnProperty('order')) {
            this.Order2();
        }
        // 把所有的@符号后面的内容提取出来
        const sqlParamsArray = me.sql.match(/[@]{1}[a-zA-Z0-9_-~!#$%^&*?\/\+]+/gim);
        if (sqlParamsArray !== null) {
            // 循环sql语句中的@内容，然后替换掉
            for(let x of sqlParamsArray) {
                const key = x.replace('@','');
                if(me.params.hasOwnProperty(key)) {
                    const value = me.getValue(key, me.params[key]);
                    me.sql = me.sql.replace(new RegExp('(' + x + ')' + '([^a-zA-Z0-9]{1}|$)', "gim"), value + '$2');
                }
            }
        }
        if(global.isDebug){
            console.log(me.sql);
        }
        return me.sql;
    }
    // 关联查询
    getSql3(join,field,option){
        // 先处理查询的字段
        let sql = `SELECT `
        for(let field_item of field){
            sql = sql + field_item + ','
        }
        sql = sql.substr(0,sql.length - 1) + ' FROM '
        // 然后处理连接,判断是一个连接，还是两个以上的连接
        if(join.constructor === Array){
            const len = join.length;
            // 判断是否有别名
            if(option.hasOwnProperty('alias')){
                let leftAlias = option.alias[join[0].leftJoin] !== undefined ? ' AS ' + option.alias[join[0].leftJoin]: '';
                let rightAlias = option.alias[join[0].rightJoin] !== undefined ? ' AS ' + option.alias[join[0].rightJoin]: '';
                sql = sql + join[0].leftJoin + leftAlias + ' ' + join[0].joinMode + ' join ' + join[0].rightJoin;
                // 处理on
                sql = sql + ' ON '
                for(let i in join[0].joinKey){
                    sql = sql + join[0].leftJoin + '.' + i + '=' + join[0].rightJoin + '.' + join[0].joinKey[i] + ' AND '
                }
                sql = sql.substr(0,sql.length - 5)
                for(let item of join.slice(1,len)){
                    rightAlias = option.alias[item.rightJoin] !== undefined ? ' AS ' + option.alias[item]: '';
                    sql = sql + ' ' + item.joinMode + ' join ' +  item.rightJoin + rightAlias + ' ON ';
                    for(let item2 in item.joinKey){
                        sql = sql + item.leftJoin + '.' + item2 + '=' + item.rightJoin  + '.' + item.joinKey[item2] + ' AND '
                    }
                    sql = sql.substr(0,sql.length - 5)
                }
            } else{
                for(let item of join){

                }
            }
        } else {
            // 判断连接对象是否有别名
            if(option.hasOwnProperty('alias')){
                const leftAlias = option.alias[join.leftJoin] !== undefined ? ' AS ' + option.alias[join.leftJoin] : '';
                const rightAlias = option.alias[join.rightJoin] !== undefined ? ' AS ' + option.alias[join.leftJoin] : ''
                sql = sql + join.leftJoin +  leftAlias  + ' ' + join.joinMode + ' join ' + join.rightJoin + rightAlias;
            } else{
                sql = sql + join.leftJoin + ' ' + join.joinMode + ' join ' + join.rightJoin;
            }
            sql = sql + ' ON '
            // 处理on
            for(let item in join.joinKey){
                sql = sql + join.leftJoin + '.' + item + '=' + join.rightJoin + '.' + join.joinKey[item] + ' AND '
            }
            sql = sql.substr(0,sql.length - 5)
        }
        // 再处理筛选字段
        if(option.hasOwnProperty('where')){
            sql = sql + ' WHERE '
            if(option.where.hasOwnProperty('and') && option.where.hasOwnProperty('or')){

            } else if(option.where.hasOwnProperty('and')){
                for(let item in option.where.and){
                    const value = this.getValue(item, option.where.and[item])
                    sql = sql + item + '=' + value + ' AND '
                }
                sql = sql.substr(0,sql.length - 5)
            } else if(option.where.hasOwnProperty('or')){

            }
        }
        console.log(sql)
        if(global.isDebug){
            console.log(global.isDebug);
        }
    }

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
}
module.exports = Querier;