import express from "express";
import bodyParser from "body-parser";
import query from "../models/query";
import excelExport from "excel-export";

const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

let queryAllSQL = `SELECT employee.*, level.level, department.department
    FROM employee, level, department
    WHERE
        employee.levelId = level.id AND
        employee.departmentId = department.id`;

router.get("/getEmployee", async (req, res) => {
  /*
   ** 拼接 sql 查询语句
   ** name: 模糊查询
   */

  let { name = "", departmentId } = req.query;
  let conditions = `AND employee.name LIKE '%${name}%'`;
  if (departmentId) {
    conditions = conditions + ` AND employee.departmentId=${departmentId}`;
  }
  let sql = `${queryAllSQL} ${conditions} ORDER BY employee.id DESC`;

  try {
    let result = await query(sql);
    result.forEach((i: any) => {
      i.key = i.id;
    });
    res.json({
      flag: 0,
      data: result,
    });
  } catch (e) {
    res.json({
      flag: 1,
      msg: e.toString(),
    });
  }
});

router.post("/createEmployee", urlencodedParser, async (req, res) => {
  let { name, departmentId, hiredate, levelId } = req.body;
  let sql = `INSERT INTO employee (name, departmentId, hiredate, levelId)
      VALUES ('${name}', ${departmentId}, '${hiredate}', ${levelId})`;
  try {
    let result = await query(sql);
    res.json({
      flag: 0,
      data: {
        key: result.insertId,
        id: result.insertId,
      },
    });
  } catch (e) {
    res.json({
      flag: 1,
      msg: e.toString(),
    });
  }
});

router.post("/deleteEmployee", async (req, res) => {
  let { id } = req.body;
  let sql = `DELETE FROM employee WHERE id=${id}`;
  try {
    let result = await query(sql);
    res.json({
      flag: 0,
    });
  } catch (e) {
    res.json({
      flag: 1,
      msg: e.toString(),
    });
  }
});

router.post("/updateEmployee", async (req, res) => {
  let { id, name, departmentId, hiredate, levelId } = req.body;
  let sql = `UPDATE employee
        SET
            name='${name}',
            departmentId=${departmentId},
            hiredate='${hiredate}',
            levelId=${levelId}
        WHERE
            id=${id}`;
  try {
    let result = await query(sql);
    res.json({
      flag: 0,
    });
  } catch (e) {
    res.json({
      flag: 1,
      msg: e.toString(),
    });
  }
});

let conf: excelExport.Config = {
  cols: [
    { caption: "员工ID", type: "number" },
    { caption: "姓名", type: "string" },
    { caption: "部门", type: "string" },
    { caption: "入职时间", type: "string" },
    { caption: "职级", type: "string" },
  ],
  rows: [],
};

router.get("/downloadEmployee", async (req, res) => {
  try {
    let result = await query(queryAllSQL); // 连接数据库，查询所有员工信息
    conf.rows = result.map((i: any) => [
      i.id,
      i.name,
      i.department,
      i.hiredate,
      i.level,
    ]);
    let excel = excelExport.execute(conf); // 生成 Excel

    // 设置返回头
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=employee.xlsx");

    // 最后写入一个二进制文件
    res.end(excel, "binary");
  } catch (e) {
    res.send(e.toString());
  }
});

module.exports = router;
