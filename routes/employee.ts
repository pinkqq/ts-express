import express from "express";
import bodyParse from "body-parser";

var router = express.Router();

/* GET employee listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

module.exports = router;
