const db = require("../config/database");

module.exports = {
    insertSensorDataSet: async (sensorData) => {
        let conn;
        let pool = db.pool;

        try {
            console.info(
                `insert sensorDataSet => ${JSON.stringify(sensorData)}`
            );
            conn = await pool.getConnection();

            const params = [
                sensorData.potId,
                sensorData.sensorDataSet.temp,
                sensorData.sensorDataSet.humi,
                sensorData.sensorDataSet.soil_humi,
                sensorData.time,
            ];

            await conn.query(
                "INSERT INTO sensor_data (pot_id, temp, humi, soil_humi, time) values (?, ?, ?, ?, ?)",
                params
            );
        } catch (error) {
            console.error(error);
        } finally {
            if (conn) conn.release();
        }
    },
    insertStateDataSet: async (stateData) => {
        let conn;
        let pool = db.pool;

        try {
            conn = await pool.getConnection();

            const count = await conn.query(
                `SELECT COUNT(*) AS cnt FROM pot_state WHERE pot_id = ${stateData.potId}`
            );
            let params;

            if (count[0].cnt == 1) {
                console.info(
                    `update stateDataSet => ${JSON.stringify(stateData)}`
                );

                params = [
                    stateData.stateDataSet.auto,
                    stateData.stateDataSet.watering,
                    stateData.stateDataSet.lighting,
                    stateData.time,
                ];

                await conn.query(
                    `UPDATE pot_state SET is_auto = ?, is_watering = ?, is_lighting = ?, time = ? WHERE pot_id = ${stateData.potId}`,
                    params
                );
            } else {
                console.info(
                    `insert stateDataSet => ${JSON.stringify(stateData)}`
                );

                params = [
                    stateData.potId,
                    stateData.stateDataSet.auto,
                    stateData.stateDataSet.watering,
                    stateData.stateDataSet.lighting,
                    stateData.time,
                ];

                await conn.query(
                    "INSERT INTO pot_state (pot_id, is_auto, is_watering, is_lighting, time) values (?, ?, ?, ?, ?)",
                    params
                );
            }
        } catch (error) {
            console.error(error);
        } finally {
            if (conn) conn.release();
        }
    },
};
