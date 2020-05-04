'use strict'

module.exports.IfSetDefalut = function (obj, defalutValue) {
    switch (defalutValue.constructor.name) {
        case 'Number':
            return isNaN(obj) ? defalutValue : obj;
        case 'Array':
            return obj.constructor.name !== 'Array' || obj.length === 0 ? defalutValue : obj;
        case 'String':
            return !obj || obj === '' ? defalutValue : obj;
        default:
            return defalutValue;
    }
};

module.exports.Like = function (obj) {
    switch (obj.constructor.name) {
        case 'String':
            return !obj || obj === '' ? '' : '%' + obj + '%';
        default:
            return obj;
    }
};

module.exports.IsNull = function (obj) {
    if (obj === undefined || obj === null) {
        return true
    } else {
        return false
    }
}   