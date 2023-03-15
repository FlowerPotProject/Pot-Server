const express = require("express");
const router = express.Router();
const filterService = require("../services/filter-service");

router.post("/code", function (req, res, next) {
    console.info(`서버에서 받은 데이터 : ${JSON.stringify(req.body)}`);
    try {
        filterService.filter(req.body);

        res.json({
            tId: req.body.tId,
            res: true,
        });
    } catch (error) {
        res.json({
            tId: req.body.tId,
            res: false,
        });
    }
});

module.exports = router;
