const constants = require("../common/constants");
const mainService = require("../services/main-service");
const reserveService = require("../services/reserve-service");
const logRepo = require("../repositories/log-repo");

module.exports = {
  filter: (json) => {
    const OP_CODE = constants.OP_CODE;

    switch (json.code) {
      // 제어 시스템 자동 제어 ON
      case OP_CODE.C_S_001:
        mainService.send(json);
        logRepo.controlLog(json);
        break;

      // 제어 시스템 자동 제어 OFF
      case OP_CODE.C_S_002:
        mainService.send(json);
        logRepo.controlLog(json);
        break;

      // 제어 관리기 물 공급 (시간)
      case OP_CODE.C_M_001:
        mainService.send(json);
        logRepo.controlLog(json);
        break;

      // 제어 관리기 물 공급 (유량)
      case OP_CODE.C_M_002:
        mainService.send(json);
        logRepo.controlLog(json);
        break;

      // 제어 관리기 조명 ON
      case OP_CODE.C_M_003:
        mainService.send(json);
        logRepo.controlLog(json);
        break;

      // 제어 관리기 조명 OFF
      case OP_CODE.C_M_004:
        mainService.send(json);
        logRepo.controlLog(json);
        break;

      // 제어 관리기 작동 중지 (자동 제어, 물 공급)
      case OP_CODE.C_M_005:
        mainService.send(json);
        logRepo.controlLog(json);
        break;

      // 예약 관리기 물 공급 (시간)
      case OP_CODE.R_M_001:
        reserveService.addWaterReserve(json);
        logRepo.reserveLog(json);
        break;

      // 예약 관리기 물 공급 (유량)
      case OP_CODE.R_M_002:
        reserveService.addWaterReserve(json);
        logRepo.reserveLog(json);
        break;

      // 예약 관리기 조명 ON
      case OP_CODE.R_M_003:
        reserveService.addLedReserve(json);
        logRepo.reserveLog(json);
        break;

      // 예약 관리기 조명 OFF
      case OP_CODE.R_M_004:
        reserveService.addLedReserve(json);
        logRepo.reserveLog(json);
        break;

      default:
        console.error("OP_CODE that doesn't exist");
    }
  },
};
