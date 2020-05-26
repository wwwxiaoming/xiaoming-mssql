# xiaoming-mssql的使用说明

## 安装
```
npm install xiaoming-mssql --save
```
# 如果对下面使用方式有什么不明白的，可以添加我本人的QQ 1693490575

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

# 使用举例
## 使用举例1
```
const pool = await this.app.mssql.get('db1');
const result = await pool.request().asyncExecute(`select * from [user] where Id = @Id`, { Id: 2 });
```
### 返回的结果
```json
{ recordsets: [ [ [Object] ] ],
  recordset: [ { Id: 2, name: '小李', age: 14 } ],
  output: {},
  rowsAffected: [ 1 ],
  sql: 'select * from [user] where Id = 2' }
```
recordsets 和 recordset都是返回结果，但是recordsets返回的是对象，recordset返回的是json的字符串
rowsAffected代表查询的行数
sql代表的是真正执行的sql语句

# 查询
查询有两种方式
1. asyncExecute
2. asyncQuery

# 插入数据
插入数据也有三种方式
1. asyncQuery
2. asyncInsert
3. parameterInsert
注意：当调用asyncQuery方法插入数据时，传入的参数一定要用数组包裹着
三种使用方法，都在下面可以看到演示的方法

# 更新数据
更新数据有两种三种方式
1. asyncQuery
2. asyncUpdate
3. parameterUpdate
下面也都有具体的传参的方式

# 删除数据
1. asyncQuery
2. asyncDelete

## 事务处理
```
const pool = this.app.mssql.get('db1');
const transaction = pool.transaction();
return await transaction.asyncBegin(async function(err) {
  const result_6 = await transaction.request().asyncQuery(`select * from [User] where UserName=@userName and Status=1`, { userName: body.UserName });
  await transaction.commit();
  await transaction.rollback(function() { });
}
```
# 关联查询
1. linkedQuery
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

## 测试排序
```
query2();
// 测试排序
function query3() {
  const sql = `select 
  * from table
  where id=@Id and name=@name
  `;
  const a = translator.execute(sql, {
    id: 1,
    name: "你好"
  }, {
    order: [{
      'OrderBy': "id",
      "Asc": 0
    }, {
      'OrderBy': 'name'
    }]
  });
  console.log(a)
}
```

### 真正执行的sql语句
```
select
  * from table
  where id=1 and name='你好'
   order by id desc,name asc
```
## 排序的第二种使用方式
```
function query36() {
  const sql = `select 
  * from table
  where id=@Id and array in (@array) and name=@name order by @OrderBy @Asc
  `;
  const sql_c = translator.execute(sql, {
    id: 1,
    array: [1, 2, 3, 4],
    name: "你好"
  }, {
    OrderBy: "id",
    "Asc": 0
  });
  console.log(sql_c)
}
```
### 真正执行的sql语句
```
select 
  * from table
  where id=1 and array in ('1','2','3','4') and name='你好' order by id DESC
```

## 测试数组形式的参数
```
function query4() {
  const sql = `select 
  * from table
  where id=@Id and array in (@array) and name=@name;
  `;
  const a = translator.execute(sql, {
    id: 1,
    array: [1, 2, 3, 4],
    name: "你好"
  }, {
    order: {
      'OrderBy': "id",
      "Asc": 0
    }
  });
  console.log(a)
}
```

### 真正执行的sql语句
```
select
  * from table
  where id=1 and array in ('1','2','3','4') and name='你好'
   order by id desc
```

## 别名替换和额外数据替换
```
function query6() {
  const sql = `insert into table (text,CreatorId,CreatorName)
      Values(@text,@CreatorId,@CreatorName)`;
  const a = translator.insert(
    sql, [{
      text1: "1",
    }, {
      text1: "2"
    }], {
      alisa: {
        text: "text1"
      },
      extraData: {
        CreatorId: 2,
        CreatorName: "clg"
      }
    }
  );
  console.log(a)
}
```

### 真正执行的sql语句
```
insert into table (text,CreatorId,CreatorName)
      values('1',2,'clg'),('2',2,'clg')
```

## 测试数组插入
```
function query7() {
  const sql = `INSERT INTO MaterialSheet (TaskId,Type,CreatorId,CreatorName,Status,CompanyId,Warehouse)
    VALUES (@TaskId,@Type,@CreatorId,@CreatorName,@Status,@CompanyId,@MaterialWarehouseEngineer)
    SELECT SCOPE_IDENTITY() AS id `;
  const a = translator.insert(
    sql, [{
      TaskId: 1,
      Type: 2,
      CreatorId: 3,
      CreatorName: 4,
      Status: 5,
      CompanyId: 6,
      MaterialWarehouseEngineer: 7,
    }]
  );
  console.log(a)
}
```
### 真正执行的sql语句
```
INSERT INTO MaterialSheet (TaskId,Type,CreatorId,CreatorName,Status,CompanyId,Warehouse)
    values ('1','2','3','4','5','6','7')
    SELECT SCOPE_IDENTITY() AS id
```

## 测试以数组形式插入，并且加上额外数据
```
function query8() {
  const sql = `INSERT [OrderLngLat] (Lng,Lat,Index,OrderId,CreatorId) 
  OUTPUT INSERTED.Iden INTO @batchInsertedIds(ID)
   Values(@Lng,@Lat,@Index,@OrderId,@CreatorId);
  `;
  const a = translator.insert(sql, [{
      "Index": 1,
      "Lat": "113.122816",
      "Lng": "23.028713"
    },
    {
      "Index": 2,
      "Lat": "113.123471",
      "Lng": "23.029058"
    },
    {
      "Index": 3,
      "Lat": "113.12339",
      "Lng": "23.028357"
    },
    {
      "Index": 4,
      "Lat": "113.1228",
      "Lng": "23.028293"
    }
  ], {
    extraData: {
      OrderId: 4,
      CreatorId: 1
    }
  });
  console.log(a)
}
```
### 真正执行的sql语句
```
INSERT [OrderLngLat] (Lng,Lat,Index,OrderId,CreatorId)
  OUTPUT INSERTED.Iden INTO @BATCHINSERTEDIDS(ID)
   values('23.028713','113.122816','1',4,1),('23.029058','113.123471','2',4,1),('23.028357','113.12339','3',4,1),('23.028293','113.1228','4',4,1)
```

## 测试查询中添加额外数据和别名
```
function query13() {
  const sql = `select Id,Name,age from [user] where Id=@Id and Name=@Name and age=@age`
  const b = translator.execute(sql, {
    age: 18,
    Id: 2,
  }, {
    alisa: {
      name: 'name1',
    },
    extraData: {
      name1: 18,
    }
  });
  console.log(b)
}
```
### 真正执行的sql语句
```
select Id,Name,age from [user] where Id=2 and Name=18 and age=18
```

## 更新操作
```
function query18() {
  const sql = 'update user set name=@name where Id=@id'
  const sql_c = translator.update(sql, {
    Name: '小李',
    id: 2,
  })
  console.log(sql_c);
}
```

### 真正执行的sql语句
```
update user set name='小李' where Id=2
```
#### 注意：update的用法和select用法是一样的，但是就是调用的方法不一样

## 插入多条insert并且是多条数据的插入
```
function query22() {
  const sql = `IF EXISTS(SELECT * FROM [user] WHERE Id=@id)
  INSERT INTO user2(name,age,gender) values(@name,@age,@gender)
  ELSE
  INSERT INTO [user](name,age) values(@name,@age);`
  const sql_c = translator.insert(sql, [{
      name: 'xiaohong',
      age: 13,
      gender: '1355'
    },
    {
      name: 'xiaozhang',
      age: 14,
      gender: '1223'
    },
    {
      name: 'xiaoli',
      age: 17,
      gender: '15'
    },
    {
      name: 'xiaoming',
      age: 20,
      gender: '23'
    },
  ],{extraData:{
    Id:2,
  }})
  console.log(sql_c);
}
```
### 真正执行的sql语句
```
IF EXISTS(SELECT * FROM [user] WHERE Id=2)
  INSERT INTO user2(name,age,gender) values('xiaohong','13','1355'),('xiaozhang','14','1223'),('xiaoli','17','15'),('xiaoming','20','23')
  ELSE
  INSERT INTO [user](name,age) values('xiaohong','13'),('xiaozhang','14'),('xiaoli','17'),('xiaoming','20');
```

## 以传参的方式插入数据
```
function query14() {
  const sql_data = [{
    name: 'xiaoming',
    age: 18
  }, {
    name: 'xiaohong'
  }]
  const sql_c = translator.parameterInsert('db.dbo.user', sql_data)
  console.log(sql_c)
}
```
### 真正执行的sql语句
```
INSERT INTO db.dbo.user(name,age) VALUES('xiaoming','18'),('xiaohong',null)
```

## 测试传参是使用别名和异步
```
function query15() {
  const sql_data = [{
    name: 'xiaoming',
    age: 18
  }, {
    name: 'xiaohong'
  }]
  const sql_c = translator.parameterInsert('db.dbo.user', sql_data, {
    alisa: {
      name1: 'name',
    },
    extraData: {
      gender: '女',
    }
  })
  console.log(sql_c)
}
```
### 真正执行的sql语句
```
INSERT INTO db.dbo.user(age,gender,name1) VALUES('18','女','xiaoming'),(null,'女','xiaohong')
```

## 传参的单条数据的插入
```
function query16() {
  const sql_data = {
    name: 'xiaoming',
    age: 18
  }
  const sql_c = translator.parameterInsert('db.dbo.user', sql_data)
  console.log(sql_c)
}
```
### 真正执行的sql语句
```
INSERT INTO db.dbo.user(name,age) VALUES('xiaoming','18')
```

## 测试更新数据使用传参的方式
```
function query31() {
  const tableName = 'Employee'
  const sql_c = translator.parameterUpdate(tableName, {
    set: {
      Name: 'aa',
      Tel: 3333
    },
    where: {
      and: {
        id: 1
      },
      orNot: {
        name: '123',
        Tel: 333
      }
    }
  })
  console.log(sql_c)
}
```

### 真正执行的sql语句
```
update [Employee] set Name = 'aa',Tel = '3333' where id = '1'
```

## 关联查询1
```
function query44(){
  console.time('计时器1')
  const sql = translator.linkedQuery({
    leftJoin:'abc',
    rightJoin:'ddd',
    joinKey:{'abca': 'ddda','test': 'test2'},
    joinMode:'left'
  },['abc.d','ddd.b'],{where: {
    and: {'abc.Id': 123,'ddd.name':'xiaoming'}
  },alias:{'abc':'a'}})
  const sql_text = `select abc.d,ddd.b from abc left join ddd on abc.abca = ddd.ddda and abc.test = ddd.test2 where abc.Id = 123 and ddd.name = 'xiaoming'`
  console.timeEnd('计时器1')
}
```
### 真正执行的sql语句
```
SELECT abc.d,ddd.b FROM abc AS a left join ddd ON abc.abca=ddd.ddda AND abc.test=ddd.test2 WHERE abc.Id=123 AND ddd.name='xiaoming'
```

## 关联查询2
```
function query45(){
  console.time('计时器1')
    const sql = translator.linkedQuery([{
      leftJoin: 'ABC',
      rightJoin: 'ddd',
      joinKey:{'aaa':'ccc'},
      joinMode:'inner',
    },{
      leftJoin: 'ddd',
      rightJoin:'eee',
      joinKey:{'accc':'dddd'},
      joinMode:'left',
    }],['ABC.qwer','eee.oiuy'],{where:{
      and:{'ABC.qwer': 'test'},
    },alias:{'ddd':'d'}})
    console.log(sql)
  console.timeEnd('计时器1')
}
```

### 真正执行的sql语句
```
SELECT ABC.qwer,eee.oiuy FROM ABC inner join ddd ON ABC.aaa=ddd.ccc left join eee ON ddd.accc=eee.dddd WHERE ABC.qwer='test'
```