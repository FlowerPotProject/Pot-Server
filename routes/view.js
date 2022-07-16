const express = require("express");
const router = express.Router();
const filterService = require("../services/filter-service");
const viewRepo = require("../repositories/view-repo");

router.get("/home", function (req, res, next) {
  try {
    viewRepo.homeDataSet().then((homeDataSet) => {
      console.info(`홈 화면 : ${JSON.stringify(homeDataSet)}`);
      res.json(homeDataSet);
    });
  } catch (error) {
    res.json({
      res: false,
    });
  }
});

router.get("/graph/day/:potId", function (req, res, next) {
  try {
    let potId = req.params.potId;
    viewRepo.dayDataSet(potId).then((dayDataSet) => {
      console.info(`일간 데이터 : ${JSON.stringify(dayDataSet)}`);
      res.json(dayDataSet);
    });
  } catch (error) {
    res.json({
      res: false,
    });
  }
});

router.get("/graph/week/:potId", function (req, res, next) {
  try {
    let potId = req.params.potId;
    viewRepo.weekDataSet(potId).then((weekDataSet) => {
      console.info(`주간 데이터 : ${JSON.stringify(weekDataSet)}`);
      res.json(weekDataSet);
    });
  } catch (error) {
    res.json({
      res: false,
    });
  }
});

router.get("/graph/month/:potId", function (req, res, next) {
  try {
    let potId = req.params.potId;
    viewRepo.monthDataSet(potId).then((monthDataSet) => {
      console.info(`월간 데이터 : ${JSON.stringify(monthDataSet)}`);
      res.json(monthDataSet);
    });
  } catch (error) {
    res.json({
      res: false,
    });
  }
});

router.get("/log", function (req, res, next) {
  try {
  } catch (error) {
    res.json({
      res: false,
    });
  }
});

module.exports = router;
