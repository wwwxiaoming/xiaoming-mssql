const ArrayExtension = true;
//除外
Array.prototype.excludes = function (distArray) {
  let srcArray = this,
    result = [];
  srcArray.forEach(element => {
    if (!distArray.includes(element)) {
      result.push(element);
    }
  });
  return result;
};
//去重合并
Array.prototype.distinctConcat = function (distArray) {
  let srcArray = this;
  return Array.from(new Set([...srcArray, ...distArray]));
};

Array.prototype.groupBy = function (...groupKeyArray) {
  let scrArray = this;
  if (groupKeyArray.length == 0) {
    return;
  }
  let groupObj = {};
  scrArray.forEach(sElm => {
    let groupKey = "";
    groupKeyArray.forEach(gElm => {
      groupKey = groupKey + "_" + sElm[gElm];
    });
    if (groupObj[groupKey]) {
      //TODO:Add
      for (const key in sElm) {
        if (typeof sElm[key] === "number") {
          groupObj[groupKey][key] += sElm[key];
        }
      }
    } else {
      groupObj[groupKey] = sElm;
    }
  });
  let result = [];
  for (const key in groupObj) {
    if (groupObj.hasOwnProperty(key)) {
      const element = groupObj[key];
      result.push(element);
    }
  }
  return result;
};

exports.default = ArrayExtension;