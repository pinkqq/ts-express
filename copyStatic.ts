import * as shelljs from "shelljs";

/*
 ** -R: 递归
 */
shelljs.cp("-R", "public", "dist");
shelljs.cp("-R", "views", "dist");
