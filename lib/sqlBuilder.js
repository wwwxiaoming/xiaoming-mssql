class SqlBuilder {
    constructor() {
        this.defaultOption = {
            alisa: {},
            extraData: {},
        }
    }
    console(msg, ...options) {
        if (global.isDebug) {
            console.log(msg, ...options);
        }
    }
    //别名替换
    replaceAlisa() {
        const me = this;
        for (const key in this.options.alisa) {
            if (me.options.alisa.hasOwnProperty(key)) {
                const value = me.options.alisa[key];
                this.sql = this.sql.replace(new RegExp('(@)' + '(' + key + ')', 'gim'), '$1' + value);
            }
        }
    }
    //额外数据替换
    replaceExtData() {
        const me = this;
        for (const key in this.options.extraData) {
            if (me.options.extraData.hasOwnProperty(key)) {
                let value = me.options.extraData[key];
                if(value === null || value === undefined) {
                    value = '';
                    this.sql = this.sql.replace(new RegExp(`@${key}`, 'gi'), `'${value}'`);
                } else if(value.constructor == String) {
                    this.sql = this.sql.replace(new RegExp(`@${key}`, 'gi'), `'${value}'`);
                } else if (value.constructor == Number) {
                    this.sql = this.sql.replace(new RegExp(`@${key}`, 'gi'), `${value}`);
                } else if(value.constructor == Array) {
                    let result;
                    result = "";
                    value.forEach((x, index) => {
                    result = result + `,'${x}'`
                    });
                    result = result.substr(1)
                    this.sql = this.sql.replace(new RegExp(`@${key}`, 'gi'), `${result}`);
                } else {
                    me.console(`extraData ${key}只允许String/Number/Array`);
                }
            }
        }
    }

    // 排序操作
    Order() {
        this.sql = this.sql.replace(/[;]{1}/,''); // 去掉尾部的;
        let value = ' order by '
        if (this.options.order.constructor === Array) {
            for(let order_data of this.options.order) {
                value = value + order_data.OrderBy
                if (!order_data.hasOwnProperty('Asc') || order_data.Asc === 1 ) {
                    value = value + ' asc,';
                } else {
                     value = value + ' desc,';
                }
             }
             this.sql = this.sql + value.substr(0,value.length-1);
        } else {
            let order_data = this.options.order
            value = value + order_data.OrderBy
            if (!order_data.hasOwnProperty('Asc') || order_data.Asc === 1 ) {
                value = value + ' asc,';
            } else {
                    value = value + ' desc,';
            }
            this.sql = this.sql + value.substr(0,value.length-1);
        }
    }
    // 将所有的键都转化成大写
    replaceCapital(params) {
        // 先把别名装换
        if(this.options.hasOwnProperty('alisa')) {
            for(let item in this.options.alisa) {
                this.options.alisa[item.toUpperCase()] = this.options.alisa[item].toUpperCase();
                delete(this.options.alisa[item]);
            }
            this.replaceAlisa();
        }
        // 把额外数据转换
        if(this.options.hasOwnProperty('extraData')) {
            for(let item in this.options.extraData) {
                this.options.extraData[item.toUpperCase()] = this.options.extraData[item];
                delete(this.options.extraData[item]);
            }
            this.replaceExtData();
        }
        // 把参数转化
        if(params) {
            if(params.constructor === Array) {
                for (let key of params){
                    for(let item in key){
                        key[item.toUpperCase()] = key[item];
                        delete(key[item]);
                    }
                }
            } else {
                for (var key in params){
                    params[key.toUpperCase()] = params[key];
                    delete(params[key]);
                }
            }
        }
        this.sql = this.sql.replace(/([@]{1}[0-9a-zA-Z_-~!#$%^&*?\/\+]+)/gim,function($1) { return $1.toUpperCase(); })
        return params
    }

    // 传参插入进行别名转化
    parameterInsertAlisa() {
        if(this.options.hasOwnProperty('alisa')) {
            if(this.params.constructor === Array) {
                this.params.forEach((item,index) => {
                    for(let key in this.options.alisa) {
                        if(item.hasOwnProperty(this.options.alisa[key])) {
                            item[key] = item[this.options.alisa[key]]
                            delete(item[this.options.alisa[key]])
                        }
                    }
                    this.params[index] = item;
                })
            } else {
                for(let key in this.options.alisa) {
                    if(this.params.hasOwnProperty(this.options.alisa[key])) {
                        this.params[key] = this.params[this.options.alisa[key]];
                        delete(this.params[this.options.alisa[key]]);
                    }
                }
            }
        }
    }

    // 传参插入进行额外数据转化
    parameterInsertExtData() {
        if(this.options.hasOwnProperty('extraData')) {
            if(this.params.constructor === Array) {
                this.params.forEach((item,index) => {
                    item = Object.assign(item,this.options.extraData);
                    this.params[index] = item;
                })
            } else {
                this.params = Object.assign(this.params,this.options.extraData);
            }
        }
    }
}

module.exports = SqlBuilder;