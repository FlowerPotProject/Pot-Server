const constants = require("../common/constants");
const db = require("../config/database");
const moment = require("moment");

module.exports = {
    // 제어 로그 DB 저장
    controlLog: async (json) => {
        let conn;
        let pool = db.pool;

        try {
            console.info(`insert control log => ${JSON.stringify(json)}`);
            conn = await pool.getConnection();

            let params;
            const OP_CODE = constants.OP_CODE;

            switch (json.code) {
                case OP_CODE.C_S_001:
                    params = [
                        moment().tz("Asia/Seoul").format("YYYY-MM-DDTHH:mm:ss"),
                        json.potId,
                        json.code,
                        json.paramsDetail.setHumi,
                    ];

                    await conn.query(
                        "INSERT INTO control_log (time, pot_id, opcode, detail) values (?, ?, ?, ?)",
                        params
                    );
                    break;

                case OP_CODE.C_S_002:
                    params = [
                        moment().tz("Asia/Seoul").format("YYYY-MM-DDTHH:mm:ss"),
                        json.potId,
                        json.code,
                    ];

                    await conn.query(
                        "INSERT INTO control_log (time, pot_id, opcode) values (?, ?, ?)",
                        params
                    );
                    break;

                case OP_CODE.C_M_001:
                    params = [
                        moment().tz("Asia/Seoul").format("YYYY-MM-DDTHH:mm:ss"),
                        json.potId,
                        json.code,
                        json.paramsDetail.controlTime,
                    ];

                    await conn.query(
                        "INSERT INTO control_log (time, pot_id, opcode, detail) values (?, ?, ?, ?)",
                        params
                    );
                    break;

                case OP_CODE.C_M_002:
                    params = [
                        moment().tz("Asia/Seoul").format("YYYY-MM-DDTHH:mm:ss"),
                        json.potId,
                        json.code,
                        json.paramsDetail.flux,
                    ];

                    await conn.query(
                        "INSERT INTO control_log (time, pot_id, opcode, detail) values (?, ?, ?, ?)",
                        params
                    );
                    break;

                case OP_CODE.C_M_003:
                    params = [
                        moment().tz("Asia/Seoul").format("YYYY-MM-DDTHH:mm:ss"),
                        json.potId,
                        json.code,
                        true,
                    ];

                    await conn.query(
                        "INSERT INTO control_log (time, pot_id, opcode, detail) values (?, ?, ?, ?)",
                        params
                    );
                    break;

                case OP_CODE.C_M_004:
                    params = [
                        moment().tz("Asia/Seoul").format("YYYY-MM-DDTHH:mm:ss"),
                        json.potId,
                        json.code,
                        false,
                    ];

                    await conn.query(
                        "INSERT INTO control_log (time, pot_id, opcode, detail) values (?, ?, ?, ?)",
                        params
                    );
                    break;

                case OP_CODE.C_M_005:
                    params = [
                        moment().tz("Asia/Seoul").format("YYYY-MM-DDTHH:mm:ss"),
                        json.potId,
                        json.code,
                    ];

                    await conn.query(
                        "INSERT INTO control_log (time, pot_id, opcode) values (?, ?, ?)",
                        params
                    );
                    break;
            }
        } catch (error) {
            console.error(error);
        } finally {
            if (conn) conn.release();
        }
    },

    // 예약 제어 로그 DB 저장
    reserveLog: async (json) => {
        let conn;
        let pool = db.pool;

        try {
            console.info(`insert control log => ${JSON.stringify(json)}`);
            conn = await pool.getConnection();

            let params;
            const OP_CODE = constants.OP_CODE;

            switch (json.code) {
                case OP_CODE.R_M_001:
                    params = [
                        moment().tz("Asia/Seoul").format("YYYY-MM-DDTHH:mm:ss"),
                        json.potId,
                        json.code,
                        json.paramsDetail.startTime,
                        json.paramsDetail.controlTime,
                    ];

                    await conn.query(
                        "INSERT INTO control_log (time, pot_id, opcode, start_time, detail) values (?, ?, ?, ?, ?)",
                        params
                    );
                    break;

                case OP_CODE.R_M_002:
                    params = [
                        moment().tz("Asia/Seoul").format("YYYY-MM-DDTHH:mm:ss"),
                        json.potId,
                        json.code,
                        json.paramsDetail.startTime,
                        json.paramsDetail.flux,
                    ];

                    await conn.query(
                        "INSERT INTO control_log (time, pot_id, opcode, start_time, detail) values (?, ?, ?, ?, ?)",
                        params
                    );
                    break;

                case OP_CODE.R_M_003:
                    params = [
                        moment().tz("Asia/Seoul").format("YYYY-MM-DDTHH:mm:ss"),
                        json.potId,
                        json.code,
                        json.paramsDetail.startTime,
                        true,
                    ];

                    await conn.query(
                        "INSERT INTO control_log (time, pot_id, opcode, start_time, detail) values (?, ?, ?, ?, ?)",
                        params
                    );
                    break;

                case OP_CODE.R_M_004:
                    params = [
                        moment().tz("Asia/Seoul").format("YYYY-MM-DDTHH:mm:ss"),
                        json.potId,
                        json.code,
                        json.paramsDetail.startTime,
                        false,
                    ];

                    await conn.query(
                        "INSERT INTO control_log (time, pot_id, opcode, start_time, detail) values (?, ?, ?, ?, ?)",
                        params
                    );
                    break;
            }
        } catch (error) {
            console.error(error);
        } finally {
            if (conn) conn.release();
        }
    },
};
