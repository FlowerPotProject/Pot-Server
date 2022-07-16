const CronJob = require("cron").CronJob;
const moment = require("moment");
const dataRepo = require("../repositories/data-repo");
const constants = require("../common/constants");
const SerialPort = require("serialport");
const Port = new SerialPort("/dev/serial0", { baudRate: 9600 });

// request data to Zigbee
function requestSensorData() {
  Port.write(JSON.stringify({ potId: 1, sensorData: 1 }));
}
function requestSensorData_2() {
  Port.write(JSON.stringify({ potId: 2, sensorData: 1 }));
}
function requestStateData() {
  Port.write(JSON.stringify({ stateData: 1 }));
}

// data variable
let potId, temp, humi, soil_humi;
var auto, watering, lighting;
let buffer = "";
let receiveData = "";
let json = "";

Port.on("open", function () {
  console.log("Pot System On...");
});

Port.on("readable", function () {
  Port.read();
});

// data from Zigbee
Port.on("data", function (data) {
  buffer = data.toString();
  //console.log("packet =>" + buffer);

  if (buffer.lastIndexOf("#") != -1) {
    receiveData += buffer.substring(0, buffer.lastIndexOf("#"));
    console.log(
      "[" + moment().tz("Asia/Seoul").format("YYYY-MM-DDTHH:mm:ss") + "]"
    );
    console.log(receiveData);

    try {
      json = JSON.parse(receiveData);

      if (json.hasOwnProperty("sensorDataSet") == true) {
        potId = json.sensorDataSet.pot_id;
        temp = json.sensorDataSet.temp;
        humi = json.sensorDataSet.humi;
        soil_humi = json.sensorDataSet.soil_humi;

        let sensorData = {
          potId: potId,
          time: moment().tz("Asia/Seoul").format("YYYY-MM-DDTHH:mm:ss"),
          sensorDataSet: {
            temp: temp,
            humi: humi,
            soil_humi: soil_humi,
          },
        };

        if (temp != undefined) {
          //console.log(sensorData);
          dataRepo.insertSensorDataSet(sensorData);
        }
      } else if (json.hasOwnProperty("stateDataSet") == true) {
        potId = json.stateDataSet.pot_id;
        auto = json.stateDataSet.is_auto;
        watering = json.stateDataSet.is_water;
        lighting = json.stateDataSet.is_led;

        let stateData = {
          potId: potId,
          time: moment().tz("Asia/Seoul").format("YYYY-MM-DDTHH:mm:ss"),
          stateDataSet: {
            auto: auto,
            watering: watering,
            lighting: lighting,
          },
        };

        //console.log(stateData);
        dataRepo.insertStateDataSet(stateData);
      }
    } catch (error) {
      requestStateData();
      console.log("re-request state data");
    }
    buffer = "";
    receiveData = "";
  } else {
    receiveData += buffer;
  }
});

module.exports = {
  start: async () => {
    const sensing = new CronJob("0 * * * * * ", function () {
      setTimeout(requestSensorData, 500);
      setTimeout(requestSensorData_2, 1500);
    });
    sensing.start();
  },

  send: (json) => {
    const OP_CODE = constants.OP_CODE;

    switch (json.code) {
      // 제어 시스템 자동 제어 ON
      case OP_CODE.C_S_001:
        var potId = json.potId;
        var code = json.code;
        var setHumi = json.paramsDetail.setHumi; // 변수명 수정
        var send = { potId: potId, code: code, setHumi: setHumi };
        Port.write(JSON.stringify(send));
        console.log("Send Auto control ON command");
        break;

      // 제어 시스템 자동 제어 OFF
      case OP_CODE.C_S_002:
        var potId = json.potId;
        var code = json.code;
        var send = { potId: potId, code: code };
        Port.write(JSON.stringify(send));
        console.log("Send Auto control OFF command");
        break;

      // 제어 관리기 물 공급 (시간)
      case OP_CODE.C_M_001:
      case OP_CODE.R_M_001:
        var potId = json.potId;
        var code = "C_M_001";
        var time = json.paramsDetail.controlTime; // 변수명 수정
        var send = { potId: potId, code: code, time: time };
        Port.write(JSON.stringify(send));
        console.log("Send Water supply (time) command");
        break;

      // 제어 관리기 물 공급 (유량)
      case OP_CODE.C_M_002:
      case OP_CODE.R_M_002:
        var potId = json.potId;
        var code = "C_M_002";
        var flux = json.paramsDetail.flux; // 변수명 수정
        var send = { potId: potId, code: code, flux: flux };
        Port.write(JSON.stringify(send));
        console.log("Send Water supply (flux) command");
        break;

      // 제어 관리기 조명 ON
      case OP_CODE.C_M_003:
      case OP_CODE.R_M_003:
        var potId = json.potId;
        var code = "C_M_003";
        var send = { potId: potId, code: code };
        Port.write(JSON.stringify(send));
        console.log("Send LED ON command");
        break;

      // 제어 관리기 조명 OFF
      case OP_CODE.C_M_004:
      case OP_CODE.R_M_004:
        var potId = json.potId;
        var code = "C_M_004";
        var send = { potId: potId, code: code };
        Port.write(JSON.stringify(send));
        console.log("Send LED OFF command");
        break;

      // 제어 관리기 작동 중지 (자동 제어, 물 공급)
      case OP_CODE.C_M_005:
        var potId = json.potId;
        var code = json.code;
        var send = { potId: potId, code: code };
        Port.write(JSON.stringify(send));
        console.log("Send water supply STOP command");
        break;

      default:
        console.error("OP_CODE that doesn't exist");
    }
  },
};
