const db = require('./databaseObject.js');

const models = {
    selectPosts: function (params = null) {
        let result = [];
        if (params == null) {
            db.all("SELECT * FROM posts;", function(err = null, rows) {
                if (err != null) {
                    result = rows;
                }
                else {
                    console.error("postsModel SQL error: Could not obtain data!");
                    console.error(err.message);
                }
            });
        }
        else {
            db.get(`SELECT * FROM posts WHERE id = ${params};`, function(err = null, row) {
                if (err != null) {
                    row !== 'undefined' ? result = row : result = {};
                }
                else {
                    console.error("postsModel SQL error: Could not obtain data!");
                    console.error(err.message);
                }
            });
        }
        return result;
    },
    insertData: function (params = null) {
        let errorMsg = null;
        db.run(`REPLACE INTO posts VALUES (${params.id}, ${params.title}, ${params.text}, ${params.categoryId}, ${params.authorId}, ${params.date});`,
        function (err) {
            if (err != null) {
                console.error("postsModel SQL error: Could not run an SQL query!");
                console.error(err.message);
                errorMsg = err.message;
            }
        });
        return errorMsg;
    },
    removeData: function (params = null) {
        let errorMsg = null;
        db.run(`DELETE FROM posts WHERE id = ${params});`,
        function (err) {
            if (err != null) {
                console.error("postsModel SQL error: Could not run an SQL query!");
                console.error(err.message);
                errorMsg = err.message;
            }
        });
        return errorMsg;
    },
    updateData function (id, params) {
        let errorMsg = null;
        let sqlSet = ('title' in params ? `title = ${params.title} ` : "") +
        ('text' in params ? `text = ${params.text} ` : "") +
        ('categoryId' in params ? `category_id = ${params.categoryId} ` : "") +
        ('authorId' in params ? `author_id = ${params.authorId} ` : "") +
        ('date' in params ? `date = ${params.date} ` : "") +;
        
        db.run(`UPDATE posts SET ${sqlSet}WHERE id = ${id};);`,
        function (err) {
            if (err != null) {
                console.error("postsModel SQL error: Could not run an SQL query!");
                console.error(err.message);
                errorMsg = err.message;
            }
        });
        return errorMsg;
    }
};

module.exports = models;
