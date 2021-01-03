const db = require('./databaseObject.js');

const models = {
    selectUsers: function (params = null) {
        let result = [];
        if (param == null) {
            db.all("SELECT * FROM users;", function(err = null, rows) {
                if (err != null) {
                    result = rows;
                }
                else {
                    console.error("categoriesModel SQL error: Could not obtain data!");
                    console.error(err.message);
                }
            });
        }
        else {

        }
        return result;
    },
    insertData: function (params = null) {
    },
    removeData: function (params = null) {
    },
    updateData function (params = null) {
    }
};

module.exports = models;
