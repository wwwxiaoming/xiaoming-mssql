const SqlBuilder = require('./sqlBuilder');
class Inserter extends SqlBuilder {
    constructor(sql, params, options) {
        super();
        this.sql = sql;
        this.options = Object.assign(this.defaultOption, options);
        this.params = params;
    }
    getSql() {
        const me = this;
        me.params = this.replaceCapital(me.params)
        if(!me.params) {
            return me.sql;
        }
        let sqlParamArray = me.sql.match(new RegExp('[@]{1}[a-zA-Z0-9_-~!#$%^&*?\/\+]+', 'gim'));
        //判断有多少个values
        let values_num = me.sql.match(/( values)(.*?)(\(.*\))/gim);
        if ((values_num === null || values_num.length <= 1) && me.params.constructor !== Array) {
            if(sqlParamArray !== null) {
                for(let x of sqlParamArray) {
                    const key = x.replace('@','');
                    if(me.params.hasOwnProperty(key)) {
                        const value = me.getValue(key, me.params[key]);
                        me.sql = me.sql.replace(new RegExp('(' + x + ')' + '([^a-zA-Z0-9]{1}|$)', "igm"), value + '$2');
                    }
                }
            }
        }else if (values_num.length > 1 && me.params.constructor !== Array) {
            for(let values_item of values_num) {
                let values_sql = ' values';
                const values_text = values_item.match(/[@]{1}[a-zA-Z0-9_-~!#$%^&*?\/\+]+/gim);
                let i_sql = '(';
                for(let i of values_text) {
                    let key = i.replace('@','');
                    if(me.params.hasOwnProperty(key)) {
                        if(me.params[key] === null || me.params[key] === undefined){
                            me.params[key] = '';
                        }
                        i_sql = i_sql + "'" + me.params[key] + "'" + ',';
                    }
                }
                i_sql = i_sql.substr(0,i_sql.length -1) + ')';
                values_sql = values_sql + i_sql + ',';
            }
            me.sql = me.sql.replace(values_item,values_sql.substr(0,values_sql.length-1));

        } else if(values_num.length > 1 && me.params.constructor === Array) {
            for(let values_item of values_num) {
                let values_sql = ' values'
                const values_text = values_item.match(/[@]{1}[a-zA-Z0-9_-~!#$%^&*?\/\+]+/gim)
                for(let value_paras of me.params) {
                    let i_sql = '(';
                    for(let i of values_text) {
                        let key = i.replace('@','');
                        if(value_paras.hasOwnProperty(key)) {
                            if(value_paras[key] === null || value_paras[key] === undefined){
                                value_paras[key] = ''
                            }
                            i_sql = i_sql + "'" + value_paras[key] + "'" + ','
                        }
                    }
                    i_sql = i_sql.substr(0,i_sql.length -1) + ')'
                    values_sql = values_sql + i_sql + ','
                }
                me.sql = me.sql.replace(values_item,values_sql.substr(0,values_sql.length-1));
            }
        } else if(me.params.constructor === Array) {
            const values_para = me.sql.match(/ values(.*)|;/im)[1]
            let sql_text = ''
            for (let item of me.params) {
                let sql_para = values_para.replace(/[;]{1}/,'')
                for(let value_item of sqlParamArray) {
                    const key = value_item.replace('@','').toUpperCase()
                    let values;
                    if(item[key] === null || item[key] === undefined){
                        values = ''
                    } else {
                        values = item[key]
                    }
                    sql_para = sql_para.replace(new RegExp(value_item), "'" + values + "'")
                }
                sql_text = sql_text + sql_para + ','
            }
            sql_text = sql_text.substr(0,sql_text.length-1)
            me.sql = me.sql.replace(/ values(.*)/gim,' values' + sql_text)
        }
        if(global.isDebug){
            console.log(me.sql);
        }
        return me.sql
    }
    getSql2() {
        const me = this;
        this.parameterInsertExtData();
        this.parameterInsertAlisa();
        let key_list = []
        // 获取到所有的key值并进行去重
        if(me.params.constructor === Array) {
            for(let item of me.params) {
                key_list = key_list.concat(Object.keys(item));
            }
        } else {
            key_list = Object.keys(me.params);
            me.params = new Array(me.params)
        }
        const key_list2 = new Set(key_list)
        // 判断数据表是否有【】符号
        const patt = /\[(.*)\]/;
        let sql_text
        if(patt.test(this.sql)) {
            sql_text = `INSERT INTO ${this.sql}(` + Array.from(key_list2).join(',') + ')'
        } else {
            sql_text = `INSERT INTO [${this.sql}](` + Array.from(key_list2).join(',') + ')'
        }
        let sql_text2 = ''
        for(let item of me.params) {
            sql_text2 = sql_text2 + '('
            for (let key_item of key_list2) {
                if(item.hasOwnProperty(key_item)) {
                    sql_text2 = sql_text2 + "'" + item[key_item] + "'" + ","
                } else {
                    sql_text2 = sql_text2 + "''" + ","
                }
            }
            sql_text2 = sql_text2.substr(0,sql_text2.length -1) + ')' + ','
        }
        sql_text = sql_text + ' VALUES'+sql_text2.substr(0,sql_text2.length -1)
        return sql_text
    }


    getValue(params, value) {
        let result = void 0;
        if(value == null) {
            value = ''
        } if (value.constructor === Array) {
            result = "";
            value.forEach((x, index) => {
            result = result + `,'${x}'`
            });
            result = result.substr(1)
        } else {
            // 使用正则防止sql注入
            const patt = /\'/
            value = value + ''
            if(patt.test(value)) {
                result = value.replace(/(\sand\s|\sor\s|\s*not\s)/igm, ' ')
                result = `"${result}"`
            } else {
                result = value.replace(/(\sand\s|\sor\s|\s*not\s)/igm, ' ')
                result = `'${result}'`
            }
        }
        return result;
    }
}
module.exports = Inserter;