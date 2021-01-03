const db = require('./databaseObject.js');

const models = {
    selectPosts: function (params = null, res) {
        let sql = params != null ? ` WHERE id = ${params}` : "";
        db.all(`SELECT * FROM posts${sql};`, (err, rows) => {
            if (err != undefined) {
                console.error("postsModel SQL error: Could not obtain data!");
                console.error(err.message);
            }
            res.json(rows);
        });
    },
    insertData: function (params = null, res) {
        db.run(`REPLACE INTO posts VALUES ('${params.id}', '${params.title}', '${params.text}', '${params.categoryId}', '${params.authorId}', '${params.date}');`,
        err => {
            if (err != null) {
                console.error("postsModel SQL error: Could not complete INSERT operation!");
                console.error(err.message);
            }
        });
    },
    removeData: function (params = null, res) {
        db.run(`DELETE FROM posts WHERE id = ${params};`,
        err => {
            if (err != undefined) {
                console.error("postsModel SQL error: Could not complete DELETE operation!");
                console.error(err.message);
            }
        });
    },
    updateData: function (id, params, res) {
        let sqlSet = ('title' in params ? `title = '${params.title}', ` : "") +
        ('text' in params ? `text = '${params.text}', ` : "") +
        ('categoryId' in params ? `category_id = '${params.categoryId}', ` : "") +
        ('authorId' in params ? `author_id = '${params.authorId}', ` : "") +
        ('date' in params ? `date = '${params.date}' ` : "");
        
        if (sqlSet.endsWith(', ')) {
            sqlSet = sqlSet.slice(0, (sqlSet.length - 2));
            sqlSet += " ";
        }

        db.run(`UPDATE posts SET ${sqlSet}WHERE id = ${id};`,
        err => {
            if (err != undefined) {
                console.error("postsModel SQL error: Could not complete UPDATE operation!");
                console.error(err.message);
            }
        });
    }
};

module.exports = models;
