const db = require('./databaseObject.js');

const models = {
    selectCategories: function (params = null, res) {
        let sql = params != null ? ` WHERE id = ${params}` : "";
        db.all(`SELECT * FROM categories${sql};`, function(err, rows) {
            if (err != undefined) {
                console.error("categoriesModel SQL error: Could not obtain data!");
                console.error(err.message);
            }
            res.json(rows);
        });
    },
    insertData: function (params = null, res) {
        db.run(`REPLACE INTO categories VALUES ('${params.id}', '${params.title}');`,
        function (err) {
            if (err != null) {
                console.error("categoriesModel SQL error: Could not complete INSERT operation!");
                console.error(err.message);
            }
        });
    },
    removeData: function (params = null, res) {
        db.run(`DELETE FROM categories WHERE id = ${params};`,
        function (err) {
            if (err != undefined) {
                console.error("categoriesModel SQL error: Could not complete DELETE operation!");
                console.error(err.message);
            }
        });
    },
    updateData: function (id, params, res) {
        db.run(`UPDATE categories SET ${params.title} WHERE id = ${id};`,
        function (err) {
            if (err != undefined) {
                console.error("categoriesModel SQL error: Could not complete UPDATE operation!");
                console.error(err.message);
            }
        });
    }
};

module.exports = models;
