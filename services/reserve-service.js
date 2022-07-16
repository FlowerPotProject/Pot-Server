const mainService = require("../services/main-service");
const reserveRepo = require("../repositories/reserve-repo");
const CronJob = require("cron").CronJob;

// 예약 TableName
const waterTableName = "water_reserve";
const ledTableName = "led_reserve";

const reserveList = [];

// 1회 예약 로직
const reserveJob = (reserveInfo, json, tableName) => {
  const newCronjob = new CronJob(
    new Date(reserveInfo.startTime.replace("T", " ")),
    function () {
      console.info("Job Start");

      json = {
        reserveId: reserveInfo.reserveId,
        potId: json.potId,
        code: json.code,
        paramsDetail: json.paramsDetail,
      };

      mainService.send(json);

      reserveRepo.deleteReserve(reserveInfo, tableName);
      this.stop();
    },
    function () {
      console.info("Job Stop");
    },
    true
  );

  reserveList.push(newCronjob);
};

module.exports = {
  // 물 공급 예약
  addWaterReserve: (json) => {
    reserveRepo
      .waterReserve(json)
      .then((reserveInfo) => {
        reserveJob(reserveInfo, json, waterTableName);
      })
      .catch((error) => {
        console.error(error);
      });
  },
  // 조명 예약
  addLedReserve: (json) => {
    reserveRepo
      .ledReserve(json)
      .then((reserveInfo) => {
        reserveJob(reserveInfo, json, ledTableName);
      })
      .catch((error) => {
        console.error(error);
      });
  },
};
