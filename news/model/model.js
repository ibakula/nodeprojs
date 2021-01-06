const sqlite = require('sqlite3').verbose();
const errorHandler = require('./errorHandler');
const db = new sqlite.Database("newsdb", errorHandler.handleDbOpen);

function createInsertStatmentBasedOnTableName(table, params) {
    let sql = `REPLACE INTO ${table} VALUES (`;
        
    switch (table) {
        case 'posts':
            sql += `'${params.id}', '${params.title}', '${params.text}',
            '${params.categoryId}', '${params.authorId}', '${params.date}');`;
            break;
        case 'categories':
            sql += `'${params.id}', '${params.title}');`;
            break;
        case 'users':
            sql += `'${params.id}', '${params.firstName}', '${params.lastName}',
            '${params.email}', '${params.signupDate}', '${params.loginDate}');`;
            break;
    }
    return sql;
}

function createUpdateStatementBasedOnTableName(table, params) {
    let sqlSet = `UPDATE ${table} SET `;
    
    switch(sqlSet) {
        case 'categories':
            sqlSet += `title = ${params.title} WHERE id = ${params.id};`;
            break;
        case 'posts':
            sqlSet = ('title' in params ? `title = '${params.title}', ` : "") +
            ('text' in params ? `text = '${params.text}', ` : "") +
            ('categoryId' in params ? `category_id = '${params.categoryId}', ` : "") +
            ('authorId' in params ? `author_id = '${params.authorId}', ` : "") +
            ('date' in params ? `date = '${params.date}' ` : "");
            break;
        case 'users':
            sqlSet += ('firstName' in params ? `title = '${params.firstName}', ` : "") +
            ('lastName' in params ? `last_name = '${params.lastName}', ` : "") +
            ('email' in params ? `email = '${params.email}', ` : "") +
            ('signupDate' in params ? `signup_date = '${params.signupDate}', ` : "") +
            ('loginDate' in params ? `login_date = '${params.loginDate}' ` : "");
            break;
    }
    
    if (sqlSet.endsWith(', ')) {
        sqlSet = sqlSet.slice(0, (sqlSet.length - 2));
        sqlSet += " ";
    }
    
    sqlSet += `WHERE id = ${id};`;
    
    return sqlSet;
}

const model = {
    selectData: (table, next) => {
        /*
            TODO: PARAMETERS DATA VALIDITY CHECK HERE
        */
        db.all(`SELECT * FROM ${table} WHERE id = ${next.request.params.id};`, (err, rows) => {
            if (err != null) {
                next.handleRequest(next.request, next.respond, {}, null);
                console.error(`${table}: Could not complete SELECT operation!`);
                console.error(err.message);
            }
            else {
                next.handleRequest(next.request, next.respond, (rows.length > 1 ? rows : rows[0]), null);
                console.log(`${table}: Completed SELECT operation!`);
            }
        });
    },
    insertData: (table, next) => {
        /*
            TODO: PARAMETERS DATA VALIDITY CHECK HERE
        */
        let sql = createInsertStatmentBasedOnTableName(table, next.req.params);
        db.run(sql, (err) => {
            if (err) {
                next.handleRequest(next.request, next.respond, { result: "Failure!" }, null);
                console.error(`${table}: Could not complete INSERT operation!`);
                console.error(err.message);
            }
            else {
                next.handleRequest(next.request,next.respond,{ result: "Success!" }, null);
                console.log(`${table}: Completed INSERT operation!`);
            }
        });
    },
    removeData: (table, next) => {
        /*
            TODO: PARAMETERS DATA VALIDITY CHECK HERE
        */
        db.run(`DELETE FROM ${table} WHERE id = ${next.req.params.id};`, (err) => {
            if (err) {
                next.handleRequest(next.request,next.respond,{ result: "Failure!" }, null);
                console.error(`${table}: Could not complete DELETE operation!`);
                console.error(err.message);
            }
            else {
                next.handleRequest(next.request,next.respond,{ result: "Success!" }, null);
                console.log(`${table}: Completed DELETE operation!`);
            }
        });
    },
    updateData: (table, next) => {
        /*
            TODO: PARAMETERS DATA VALIDITY CHECK HERE
        */
        let sqlSet = createUpdateStatementBasedOnTableName(table, next.req.params);
        db.run(sqlSet, (err) => {
            if (err) {
                next.handleRequest(next.request,next.respond,{ result: "Failure!" }, null);
                console.error(`${table}: Could not complete UPDATE operation!`);
                console.error(err.message);
            }
            else {
                next.handleRequest(next.request,next.respond,{ result: "Success!" }, null);
                console.log(`${table}: Completed UPDATE operation!`);
            }
        });
    }
};

module.exports = model;