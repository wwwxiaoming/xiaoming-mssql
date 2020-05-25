# xiaoming-mssql的使用说明

## 安装
```
npm install xiaoming-mssql --save
```

## pulgin.js中的配置
```
exports.mssql = {
  enable: true,
  package: 'xiaoming-mssql',
};
```
## config中的配置
```
config.mssql = {
    clients: {
      db1: {
        user: '你的数据库用户名',
        password: '数据库连接密码',
        server: '数据库服务器ip',
        database: '数据库名',
        port: 端口号,
      },
    },
  };
```
### 注意：连接数据库的端口号只能是数字

## 普通的传参查询
```
function query() {
  const sql = `select * from [user] where Id=@id and customerCompanyId=@customerCompanyId`;
  const b = translator.execute(sql, {
    id: 1,
    customerCompanyId: '123',
  });
  console.log(b)
}
```
### 真正执行的sql语句
```
select * from [user] where Id=1 and customerCompanyId='123'
```

## 当传参的值为null或者undefine值
```
function query2() {
  const sql = `
    declare @CustomerTypeId int
    select stringValue,nullValue,numberValue,CustomerType from log
    where stringValue = @stringValue and nullValue = @nullValue and numberValue = @numberValue and CustomerType=@CustomerType and number=@number`
  const b = translator.execute(sql, {
    stringValue: "string",
    nullValue: null,
    numberValue: 0,
    CustomerType: 'Type',
    number: undefined,
  });
  console.log(b)
}
```
### 真正执行的sql语句
```
declare @CUSTOMERTYPEID int
select stringValue,nullValue,numberValue,CustomerType from log
where stringValue = 'string' and nullValue = '' and numberValue = 0 and CustomerType='Type' and number=''
```
