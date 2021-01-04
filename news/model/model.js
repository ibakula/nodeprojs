const sqlite = require('sqlite3');
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

function createUpdateStatementBasedOnTableName(id, table, params) {
    let sqlSet = `UPDATE ${table} SET `;
    
    switch(sqlSet) {
        case 'categories':
            sqlSet += `title = ${params.title} WHERE id = ${id};`;
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
    selectData: async function (table, id) {
        /*
            TODO: PARAMETERS DATA VALIDITY CHECK HERE
        */
        try {
            let data = await db.all(`SELECT * FROM ${table} WHERE id = ${id};`);
            return data;
        }
        catch (err) {
            console.error("SQL error: Could not complete SELECT operation!");
            console.error(err.message);
            throw Error("An error with the query has occured!");
        }
    },
    insertData: async function (table, params) {
        /*
            TODO: PARAMETERS DATA VALIDITY CHECK HERE
        */
        try {
            let sql = createInsertStatmentBasedOnTableName(table, params);
            db.run(sql);
        }
        catch(err) {
            console.error("SQL error: Could not complete INSERT operation!");
            console.error(err.message);
            throw Error("An error with the query has occured!");
        }
    },
    removeData: function (table, params) {
        /*
            TODO: PARAMETERS DATA VALIDITY CHECK HERE
        */
        try {
            db.run(`DELETE FROM ${table} WHERE id = ${params};`);
        }
        catch(err) {
            console.error("SQL error: Could not complete DELETE operation!");
            console.error(err.message);
            throw Error("An error with the query has occured!");
        }
    },
    updateData: function (id, table, params) {
        /*
            TODO: PARAMETERS DATA VALIDITY CHECK HERE
        */
        try {
            let sqlSet = createUpdateStatementBasedOnTableName(id, table, params);
            db.run(sqlSet);
        }
        catch(err) {
            console.error("SQL error: Could not complete UPDATE operation!");
            console.error(err.message);
            throw Error("An error with the query has occured!");
        }
    }
};

module.exports = model;