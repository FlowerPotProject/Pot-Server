const db = require("../config/database");

module.exports = {
  // 물 공급 (유량) 예약 등록
  waterReserve: async (json) => {
    let conn;
    let pool = db.pool;

    try {
      console.info(`insert water reserve => ${JSON.stringify(json)}`);
      conn = await pool.getConnection();

      const params = [
        json.potId,
        json.paramsDetail.startTime,
        json.paramsDetail.flux,
      ];

      let res = await conn.query(
        "INSERT INTO water_reserve (pot_id, start_time, flux) values (?, ?, ?)",
        params
      );

      let reserveInfo = {
        reserveId: res.insertId,
        potId: json.potId,
        startTime: json.paramsDetail.startTime,
        flux: json.paramsDetail.flux,
      };

      return reserveInfo;
    } catch (error) {
      console.error(error);
    } finally {
      if (conn) conn.release();
    }
  },

  // 조명 예약 등록
  ledReserve: async (json) => {
    let conn;
    let pool = db.pool;
    let isOn;

    try {
      console.info(`insert led reserve => ${JSON.stringify(json)}`);
      conn = await pool.getConnection();

      if (json.code == "R_M_003") {
        isOn = true;
      } else {
        isOn = false;
      }

      const params = [json.potId, json.paramsDetail.startTime, isOn];

      let res = await conn.query(
        "INSERT INTO led_reserve (pot_id, start_time, is_on) values (?, ?, ?)",
        params
      );

      let reserveInfo = {
        reserveId: res.insertId,
        potId: json.potId,
        startTime: json.paramsDetail.startTime,
        isOn: isOn,
      };

      return reserveInfo;
    } catch (error) {
      console.error(error);
    } finally {
      if (conn) conn.release();
    }
  },

  // 예약 작업 후 DB에서 삭제
  deleteReserve: async (reserveInfo, tableName) => {
    let conn;
    let pool = db.pool;
    let id = reserveInfo.reserveId;

    try {
      console.info(`delete reserve => ${JSON.stringify(reserveInfo)}`);
      conn = await pool.getConnection();

      if (tableName == "water_reserve") {
        await conn.query(
          "DELETE FROM water_reserve WHERE reserve_id = (?)",
          id
        );
      } else {
        await conn.query("DELETE FROM led_reserve WHERE reserve_id = (?)", id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (conn) conn.release();
    }
  },
};
