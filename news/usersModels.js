const db = require('./databaseObject.js');

const models = {
    selectUsers: function (params = null, res) {
        let sql = params != null ? ` WHERE id = ${params}` : "";
        db.all(`SELECT * FROM users${sql};`, function(err, rows) {
            if (err != undefined) {
                console.error("usersModel SQL error: Could not obtain data!");
                console.error(err.message);
            }
            res.json(rows);
        });
    },
    insertData: function (params = null, res) {
        db.run(`REPLACE INTO users VALUES ('${params.id}', '${params.firstName}', '${params.lastName}', '${params.email}', '${params.signupDate}', '${params.loginDate}');`,
        function (err) {
            if (err != null) {
                console.error("usersModel SQL error: Could not complete INSERT operation!");
                console.error(err.message);
            }
        });
    },
    removeData: function (params = null, res) {
        db.run(`DELETE FROM users WHERE id = ${params};`,
        function (err) {
            if (err != undefined) {
                console.error("usersModel SQL error: Could not complete DELETE operation!");
                console.error(err.message);
            }
        });
    },
    updateData: function (id, params, res) {
        let sqlSet = ('firstName' in params ? `title = '${params.firstName}', ` : "") +
        ('lastName' in params ? `last_name = '${params.lastName}', ` : "") +
        ('email' in params ? `email = '${params.email}', ` : "") +
        ('signupDate' in params ? `signup_date = '${params.signupDate}', ` : "") +
        ('loginDate' in params ? `login_date = '${params.loginDate}' ` : "");
        
        if (sqlSet.endsWith(', ')) {
            sqlSet = sqlSet.slice(0, (sqlSet.length - 2));
            sqlSet += " ";
        }

        db.run(`UPDATE users SET ${sqlSet}WHERE id = ${id};`,
        function (err) {
            if (err != undefined) {
                console.error("usersModel SQL error: Could not complete UPDATE operation!");
                console.error(err.message);
            }
        });
    }
};

module.exports = models;
