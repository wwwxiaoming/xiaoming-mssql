# xiaoming-mssql的使用说明

## 安装
```
npm install xiaoming-mssql --save
```

## pulgin.js中的配置
```
exports.mssql = {
  enable: true,
  package: 'jt-egg-mssql',
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

## 连接查询
```
async index3() {
    console.time('计时器3');
    const pool = this.app.mssql.get('db1');
    const result = await pool.request().asyncExecute(`select * from Employee where Name=@name or id in (@id_array)`, {
      id_array: [ 1, 2, 3, 4, 5, 6, 7 ],
      name: null,
    });
    console.timeEnd('计时器3');
    return result;
  }
```
