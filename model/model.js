const sqlite = require('sqlite3').verbose();
const errorHandler = require('./errorHandler');
const db = new sqlite.Database("newsdb", errorHandler.handleDbOpen);

const usersStruct = {
    'id' : 'number',
    'firstName' : 'string',
    'lastName' : 'string',
    'email' : 'string',
    'signupDate' : 'string',
    'loginDate' : 'string' 
};

const postsStruct = {
    'id' : 'number',
    'title' : 'string',
    'text' : 'string',
    'categoryId' : 'number',
    'authorId' : 'number',
    'date' : 'string'
};

const categoriesStruct = {
    'id': 'number', 
    'title': 'string'
};

function containsValidInput(table, params) {
    let struct = null;
    
    switch(table) {
        case `users`:
            struct = usersStruct;
            break;
        case `posts`:
            struct = postsStruct;
            break;
        case `categories`:
            struct = categoriesStruct;
            break;
    }
    
    if (struct != null) {
        let hasRequiredParams = false; // Purpose of this is INSERT queries
        for (let i in struct) {
            // Establish whether we even have this param passed
            if (i in params) {
                if (struct[i] == 'number') { // Should the param contain only numbers?
                    let param = parseInt(params[i]);
                    if (Number.isNaN(param) ||
                       (String(param).length == params[i].length) != true) {
                        return false;
                    }
                }
                if (params[i].search("INTO") > -1 || // Unpermitted word
                params[i].search("FROM") > -1)  { // Queries not permitted!
                    return false;
                }
                hasRequiredParams = true;
            }
        }
        if (!hasRequiredParams) { // No params specified? Then prevent querying.
            return false;
        }
    }
    
    return true;
}

function createInsertStatmentBasedOnTableName(table, params) {
    let sql = `REPLACE INTO ${table} VALUES (`;
        
    switch (table) {
        case `posts`:
            sql += `'${params.id}', '${params.title}', '${params.text}',
            '${params.categoryId}', '${params.authorId}', '${params.date}');`;
            break;
        case `categories`:
            sql += `'${params.id}', '${params.title}');`;
            break;
        case `users`:
            sql += `'${params.id}', '${params.firstName}', '${params.lastName}',
            '${params.email}', '${params.signupDate}', '${params.loginDate}');`;
            break;
    }
    return sql;
}

function createUpdateStatementBasedOnTableName(table, params, id) {
    let sqlSet = `UPDATE ${table} SET `;
    
    switch(table) {
        case `categories`:
            sqlSet += `title = ${params.title} `;
            break;
        case `posts`:
            sqlSet += ('title' in params ? `title = '${params.title}', ` : '') +
            ('text' in params ? `text = '${params.text}', ` : '') +
            ('categoryId' in params ? `category_id = '${params.categoryId}', ` : '') +
            ('authorId' in params ? `author_id = '${params.authorId}', ` : '') +
            ('date' in params ? `date = '${params.date}' ` : "");
            break;
        case `users`:
            sqlSet += ('firstName' in params ? `title = '${params.firstName}', ` : '') +
            ('lastName' in params ? `last_name = '${params.lastName}', ` : '') +
            ('email' in params ? `email = '${params.email}', ` : '') +
            ('signupDate' in params ? `signup_date = '${params.signupDate}', ` : '') +
            ('loginDate' in params ? `login_date = '${params.loginDate}' ` : '');
            break;
    }
    
    if (sqlSet.endsWith(`, `)) {
        sqlSet = sqlSet.slice(0, (sqlSet.length - 2));
        sqlSet += " ";
    }
    
    sqlSet += `WHERE id = ${id};`;
    
    return sqlSet;
}

const model = {
    selectData: (table, next) => {
        // Validity check, prevent execution of a query if false    
        if (!containsValidInput(table, next.request.params)) {
            next.handleRequest(next.request, next.respond, {'result':'input compliance fallthrough!'}, null);
            return;
        }
        
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
        // Validity check, prevent execution of a query if false  
        if (!containsValidInput(table, next.request.params)) {
            next.handleRequest(next.request, next.respond, {'result':'input compliance fallthrough!'}, null);
            return;
        }
        let sql = createInsertStatmentBasedOnTableName(table, next.request.body);
        db.run(sql, (err) => {
            if (err != null) {
                next.handleRequest(next.request, next.respond, { result: `Failure!` }, null);
                console.error(`${table}: Could not complete INSERT operation!`);
                console.error(err.message);
            }
            else {
                next.handleRequest(next.request,next.respond,{ result: `Success!` }, null);
                console.log(`${table}: Completed INSERT operation!`);
            }
        });
    },
    removeData: (table, next) => {
        // Validity check, prevent execution of a query if false
        if (!containsValidInput(table, next.request.params)) {
            next.handleRequest(next.request, next.respond, {'result':'input compliance fallthrough!'}, null);
            return;
        }
        db.run(`DELETE FROM ${table} WHERE id = ${next.request.params.id};`, (err) => {
            if (err != null) {
                next.handleRequest(next.request, next.respond, { result: `Failure!` }, null);
                console.error(`${table}: Could not complete DELETE operation!`);
                console.error(err.message);
            }
            else {
                next.handleRequest(next.request, next.respond, { result: `Success!` }, null);
                console.log(`${table}: Completed DELETE operation!`);
            }
        });
    },
    updateData: (table, next) => {
        // Validity check, prevent execution of a query if false
        if (!containsValidInput(table, next.request.body)) {
            next.handleRequest(next.request, next.respond, {'result':'input compliance fallthrough!'}, null);
            return;
        }
        let sqlSet = createUpdateStatementBasedOnTableName(table, next.request.body, next.request.params.id);
        db.run(sqlSet, (err) => {
            if (err != null) {
                next.handleRequest(next.request,next.respond,{ result: `Failure!` }, null);
                console.error(`${table}: Could not complete UPDATE operation!`);
                console.error(err.message);
            }
            else {
                next.handleRequest(next.request,next.respond,{ result: `Success!` }, null);
                console.log(`${table}: Completed UPDATE operation!`);
            }
        });
    }
};

module.exports = model;