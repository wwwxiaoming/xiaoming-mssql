"use strict";

/** TODO:
 * 1.Why can not debug in describe it seems that some time will hit the breakpoint
 * 2.no easy to user tran to commit
 */
const {
  app,
  mock,
  assert
} = require('egg-mock/bootstrap');

describe("test/mssql.test.js", () => {
  it("singletonDb Test", async () => {
    const pool = await app.mssql.get('db1');
    const result = await pool.request().query("select 1 as a");
    assert(result.recordset[0].a == 1);
  });
  it("multipleDb  Test", async () => {
    const pool = await app.mssql.get('db1');
    const result = await pool.request().query("select 1 as a");
    assert(result.recordset[0].a == 1);
    const pool2 = await app.mssql.get('db1');
    const result2 = await pool2.request().query("select 2 as a");
    assert(result2.recordset[0].a == 2);
  });
  it("asyncQuery Test", async () => {
    const pool = await app.mssql.get('db1');
    const result = await pool.request().asyncQuery("select * from Company where id=@id", {
      id: 1
    });
    assert(result.recordset[0].Id == 1);
  });
  it("asyncInsert Test", async () => {
    const pool = await app.mssql.get('db1');
    const result = await pool.request().asyncInsert(`insert into myTable2 (TemplateId) values(@TemplateId) ; select SCOPE_IDENTITY() as id`, [{
      Templateid: 1
    }]);
    assert(result.recordset[0].id !== undefined);
  });
  it("asynInsert Test2", async () => {
    const pool = await app.mssql.get('db1')
    const result = await pool.request().asyncInsert(`Create table #NodeTemp (
      DeviceNum Nvarchar(50),
      SimNum Nvarchar(50)
      );
      insert into #NodeTemp (DeviceNum,SimNum)
      values(@DeviceNum,@SimNum);
      select bundleTable.Id as BundleId
      from (select b.Id, d.DeviceNum,s.SimNum from dbo.Bundle b
          left join Device d on b.DeviceId=d.Id
          left join Sim s on b.SimId=s.Id
          where b.Status='1' and b.CompanyId=65) bundleTable
      left join #NodeTemp nt on bundleTable.DeviceNum=nt.DeviceNum and bundleTable.SimNum=nt.SimNum
      drop table #NodeTemp`, [{
      DeviceNum: '20180620B',
      SimNum: '11122233336'
    }]);

    console.log(result);

  })

  it("asyn transaction test", async () => {
    const pool = await app.mssql.get('db1');
    const transaction = pool.transaction();
    await transaction.asyncBegin(async err => {
      try {
        const result = await transaction.request().asyncQuery(`insert into myTable2 (TemplateId) values(@TemplateId) ; select SCOPE_IDENTITY() as id`, {
          Templateid: 1
        });
        console.log(result.recordset[0].id);
        assert(result.recordset[0].id !== undefined);
        const result2 = await transaction.request().asyncQuery(`insert into myTable (TemplateName) values(@TemplateName) ; select SCOPE_IDENTITY() as id`, {
          TemplateName: "abc"
        });
        assert(result2.recordset[0].id !== undefined);
        transaction.commit()
      } catch (error) {
        console.log(error);
        transaction.rollback();
      }
    });
  })

});