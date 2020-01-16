module.exports = (data) => {
    let express = require('express');
    let router = express.Router();

    router.get('/', (req, res) => {
        res.json(data);
    });

    router.get('/:id', (req, res) => {
        let id = req.params.id;
        res.json(data.find(k => k.id === Number(id)));
    });

    return router;
};