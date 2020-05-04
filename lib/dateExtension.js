/**
 * 获取本周、本季度、本月、上月的开始日期、结束日期
 * todo 将所有方法都变成静态方法；
 */
const DataExtension = true;
//格式化日期：yyyy-MM-dd 
Date.prototype.toFormatString = function (format) {
    let result = format || "yyyy-MM-dd HH:mm:ss"
    let myYear = this.getFullYear();
    let myMonth = this.getMonth() + 1;
    let myDate = this.getDate();
    let myHour = this.getHours();
    let myMinutes = this.getMinutes();
    let mySecond = this.getSeconds();
    let obj = {
        "yyyy": myYear,
        "MM": myMonth < 10 ? ("0" + myMonth) : myMonth,
        "dd": myDate < 10 ? ("0" + myDate) : myDate,
        "HH": myHour < 10 ? ("0" + myHour) : myHour,
        "mm": myMinutes < 10 ? ("0" + myMinutes) : myMinutes,
        "ss": mySecond < 10 ? ("0" + mySecond) : mySecond
    }
    for (const key in obj) {
        result = result.replace(key, obj[key]);
    }
    return result;
}

Date.prototype.getMonthDays = function () {
    let monthStartDate = new Date(this.getFullYear(), this.getMonth(), 1);
    let monthEndDate = new Date(this.getFullYear(), this.getMonth() + 1, 1);
    let days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
    return days;
}
Date.prototype.addDay = function (value) {
    this.setDate(this.getDate() + value);
    return this;
}

Date.prototype.getDayStart = function (value) {
    return new Date(this.getFullYear(), this.getMonth(), this.getDate());
}
Date.prototype.getDayEnd = function () {
    return new Date(this.getFullYear(), this.getMonth(), this.getDate(), 23, 59, 59);
}
Date.prototype.getMonthStart = function () {
    return new Date(this.getFullYear(), this.getMonth(), 1);
}
Date.prototype.getMonthEnd = function () {
    return new Date(this.getFullYear(), this.getMonth(), this.getMonthDays(), 23, 59, 59);
}


exports.default = DataExtension;