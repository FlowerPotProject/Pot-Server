const { query } = require("express");
const db = require("../config/database");
const moment = require("moment");

module.exports = {
    homeDataSet: async () => {
        let conn;
        let pool = db.pool;

        let homeDataSet = {
            potList: [],
            reserveList: {
                waterReserve: [],
                lightReserve: [],
            },
        };

        try {
            conn = await pool.getConnection();

            const potInfo = await conn.query(
                "SELECT p.pot_id, p.is_main, sd.temp, sd.humi, sd.soil_humi, ps.is_watering, ps.is_lighting, ps.is_auto FROM pot p INNER JOIN sensor_data sd ON p.pot_id = sd.pot_id INNER JOIN pot_state ps ON p.pot_id = ps.pot_id WHERE sd.`time` >= DATE_ADD(now(), INTERVAL -1 MINUTE) GROUP BY p.pot_id;"
            );
            potInfo.forEach((element) => {
                homeDataSet.potList.push({
                    potId: element.pot_id,
                    sensorData: {
                        temp: element.temp,
                        humi: element.humi,
                        soilHumi: element.soil_humi,
                    },
                    stateData: {
                        isWatering: element.is_watering,
                        isLighting: element.is_lighting,
                        isAuto: element.is_auto,
                        isMainPot: element.is_main,
                    },
                });
            });

            const waterReserve = await conn.query(
                "SELECT reserve_id, pot_id, start_time, flux FROM water_reserve"
            );
            waterReserve.forEach((element) => {
                homeDataSet.reserveList.waterReserve.push({
                    reserveId: element.reserve_id,
                    potId: element.pot_id,
                    startTime: moment(element.start_time)
                        .tz("Asia/Seoul")
                        .format("YYYY-MM-DDTHH:mm:ss"),
                    flux: element.flux,
                });
            });

            const lightReserve = await conn.query(
                "SELECT reserve_id, pot_id, start_time, is_on FROM led_reserve"
            );
            lightReserve.forEach((element) => {
                homeDataSet.reserveList.lightReserve.push({
                    reserveId: element.reserve_id,
                    potId: element.pot_id,
                    startTime: moment(element.start_time)
                        .tz("Asia/Seoul")
                        .format("YYYY-MM-DDTHH:mm:ss"),
                    isOn: element.is_on,
                });
            });

            return homeDataSet;
        } catch (error) {
            console.error(error);
        } finally {
            if (conn) conn.release();
        }
    },

    dayDataSet: async (potId) => {
        let conn;
        let pool = db.pool;

        let dayDataSet = {
            temp: [],
            humi: [],
            soilHumi: [],
            log: [],
        };

        let array = [];

        try {
            conn = await pool.getConnection();

            const dayTemp = await conn.query(
                `SELECT time, AVG(temp) as val FROM sensor_data WHERE time >= DATE_ADD(now(), INTERVAL -24 HOUR) AND pot_id = ${potId} GROUP BY MONTH(time), DAY(time), HOUR(time), FLOOR(MINUTE(time)/10)*10;`
            );
            dayTemp.forEach((element) => {
                dayDataSet.temp.push({
                    time: moment(element.time).tz("Asia/Seoul").format("HH:mm"),
                    val: element.val,
                });
            });

            const dayHumi = await conn.query(
                `SELECT time, AVG(humi) as val FROM sensor_data WHERE time >= DATE_ADD(now(), INTERVAL -24 HOUR) AND pot_id = ${potId} GROUP BY MONTH(time), DAY(time), HOUR(time), FLOOR(MINUTE(time)/10)*10;`
            );
            dayHumi.forEach((element) => {
                dayDataSet.humi.push({
                    time: moment(element.time).tz("Asia/Seoul").format("HH:mm"),
                    val: element.val,
                });
            });

            const daySoilHumi = await conn.query(
                `SELECT time, AVG(soil_humi) as val FROM sensor_data WHERE time >= DATE_ADD(now(), INTERVAL -24 HOUR) AND pot_id = ${potId} GROUP BY MONTH(time), DAY(time), HOUR(time), FLOOR(MINUTE(time)/10)*10;`
            );
            daySoilHumi.forEach((element) => {
                dayDataSet.soilHumi.push({
                    time: moment(element.time).tz("Asia/Seoul").format("HH:mm"),
                    val: element.val,
                });
            });

            const dayContorlLog = await conn.query(
                `SELECT CASE WHEN MINUTE(time) < 10 THEN DATE_FORMAT(time, '%Y-%m-%d %H:00') WHEN MINUTE(time) >= 10 AND MINUTE(time) < 20 THEN DATE_FORMAT(time, '%Y-%m-%d %H:10') WHEN MINUTE(time) >= 20 AND MINUTE(time) < 30 THEN DATE_FORMAT(time, '%Y-%m-%d %H:20') WHEN MINUTE(time) >= 30 AND MINUTE(time) < 40 THEN DATE_FORMAT(time, '%Y-%m-%d %H:30') WHEN MINUTE(time) >= 40 AND MINUTE(time) < 50 THEN DATE_FORMAT(time, '%Y-%m-%d %H:40') WHEN MINUTE(time) >= 50 AND MINUTE(time) < 60 THEN DATE_FORMAT(time, '%Y-%m-%d %H:50') END AS time FROM control_log WHERE time >= DATE_ADD(now(), INTERVAL -24 HOUR) AND pot_id = ${potId} AND (opcode = 'C_M_001' OR opcode = 'C_M_002') GROUP BY MONTH(time), DAY(time), HOUR(time), MINUTE(time);`
            );
            dayContorlLog.forEach((element) => {
                array.push({
                    time: moment(element.time)
                        .tz("Asia/Seoul")
                        .format("YYYY-MM-DDTHH:mm:ss"),
                });
            });

            const dayReserveLog = await conn.query(
                `SELECT CASE WHEN MINUTE(start_time) < 10 THEN DATE_FORMAT(start_time, '%Y-%m-%d %H:00') WHEN MINUTE(start_time) >= 10 AND MINUTE(start_time) < 20 THEN DATE_FORMAT(start_time, '%Y-%m-%d %H:10') WHEN MINUTE(start_time) >= 20 AND MINUTE(start_time) < 30 THEN DATE_FORMAT(start_time, '%Y-%m-%d %H:20') WHEN MINUTE(start_time) >= 30 AND MINUTE(start_time) < 40 THEN DATE_FORMAT(start_time, '%Y-%m-%d %H:30') WHEN MINUTE(start_time) >= 40 AND MINUTE(start_time) < 50 THEN DATE_FORMAT(start_time, '%Y-%m-%d %H:40') WHEN MINUTE(start_time) >= 50 AND MINUTE(start_time) < 60 THEN DATE_FORMAT(start_time, '%Y-%m-%d %H:50') END AS time  FROM control_log WHERE time >= DATE_ADD(now(), INTERVAL -24 HOUR) AND pot_id = ${potId} AND (opcode = 'R_M_001' OR opcode = 'R_M_002') GROUP BY MONTH(time), DAY(time), HOUR(time), MINUTE(time);`
            );
            dayReserveLog.forEach((element) => {
                array.push({
                    time: moment(element.time)
                        .tz("Asia/Seoul")
                        .format("YYYY-MM-DDTHH:mm:ss"),
                });
            });

            array.sort((a, b) => new Date(a.time) - new Date(b.time));
            array.forEach((element) => {
                dayDataSet.log.push({
                    time: moment(element.time).tz("Asia/Seoul").format("HH:mm"),
                });
            });

            return dayDataSet;
        } catch (error) {
            console.error(error);
        } finally {
            if (conn) conn.release();
        }
    },

    weekDataSet: async (potId) => {
        let conn;
        let pool = db.pool;

        let weekDataSet = {
            temp: [],
            humi: [],
            soilHumi: [],
            log: [],
        };

        try {
            conn = await pool.getConnection();

            const weekTemp = await conn.query(
                `SELECT time, AVG(temp) as val FROM sensor_data WHERE time >= DATE_ADD(now(), INTERVAL -7 DAY) AND pot_id = ${potId} GROUP BY MONTH(time), DAY(time), HOUR(time);`
            );
            weekTemp.forEach((element) => {
                weekDataSet.temp.push({
                    time: moment(element.time)
                        .tz("Asia/Seoul")
                        .format("DD일 HH시"),
                    val: element.val,
                });
            });

            const weekHumi = await conn.query(
                `SELECT time, AVG(humi) as val FROM sensor_data WHERE time >= DATE_ADD(now(), INTERVAL -7 DAY) AND pot_id = ${potId} GROUP BY MONTH(time), DAY(time), HOUR(time);`
            );
            weekHumi.forEach((element) => {
                weekDataSet.humi.push({
                    time: moment(element.time)
                        .tz("Asia/Seoul")
                        .format("DD일 HH시"),
                    val: element.val,
                });
            });

            const weekSoilHumi = await conn.query(
                `SELECT time, AVG(soil_humi) as val FROM sensor_data WHERE time >= DATE_ADD(now(), INTERVAL -7 DAY) AND pot_id = ${potId} GROUP BY MONTH(time), DAY(time), HOUR(time);`
            );
            weekSoilHumi.forEach((element) => {
                weekDataSet.soilHumi.push({
                    time: moment(element.time)
                        .tz("Asia/Seoul")
                        .format("DD일 HH시"),
                    val: element.val,
                });
            });

            return weekDataSet;
        } catch (error) {
            console.error(error);
        } finally {
            if (conn) conn.release();
        }
    },

    monthDataSet: async (potId) => {
        let conn;
        let pool = db.pool;

        let monthDataSet = {
            temp: [],
            humi: [],
            soilHumi: [],
            log: [],
        };

        try {
            conn = await pool.getConnection();

            const monthTemp = await conn.query(
                `SELECT time, AVG(temp) as val FROM sensor_data WHERE time >= DATE_ADD(now(), INTERVAL -30 DAY) AND pot_id = ${potId} GROUP BY MONTH(time), DAY(time);`
            );
            monthTemp.forEach((element) => {
                monthDataSet.temp.push({
                    time: moment(element.time)
                        .tz("Asia/Seoul")
                        .format("MM월 DD일"),
                    val: element.val,
                });
            });

            const monthHumi = await conn.query(
                `SELECT time, AVG(humi) as val FROM sensor_data WHERE time >= DATE_ADD(now(), INTERVAL -30 DAY) AND pot_id = ${potId} GROUP BY MONTH(time), DAY(time);`
            );
            monthHumi.forEach((element) => {
                monthDataSet.humi.push({
                    time: moment(element.time)
                        .tz("Asia/Seoul")
                        .format("MM월 DD일"),
                    val: element.val,
                });
            });

            const monthSoilHumi = await conn.query(
                `SELECT time, AVG(soil_humi) as val FROM sensor_data WHERE time >= DATE_ADD(now(), INTERVAL -30 DAY) AND pot_id = ${potId} GROUP BY MONTH(time), DAY(time);`
            );
            monthSoilHumi.forEach((element) => {
                monthDataSet.soilHumi.push({
                    time: moment(element.time)
                        .tz("Asia/Seoul")
                        .format("MM월 DD일"),
                    val: element.val,
                });
            });

            return monthDataSet;
        } catch (error) {
            console.error(error);
        } finally {
            if (conn) conn.release();
        }
    },
};
