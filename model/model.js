const sqlite = require('sqlite3').verbose();
const errorHandler = require('./errorHandler');
const db = new sqlite.Database('./database/news.db', errorHandler.handleDbOpen);

const usersStruct = {
    'id' : 'number',
    'firstName' : 'string',
    'lastName' : 'string',
    'password' : 'string',
    'email' : 'string',
    // 0 - user, 1 - Author/Editor, 2 - Moderator, 3 - Admin
    'permissions' : 'number',
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
                    params[i].search("FROM") > -1 ||
                    (i == 'email' && 
                    params[i].search("@") == -1))  {
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
    let sql = `REPLACE INTO ${table}`;

    switch (table) {
        case `posts`:
            let now = Date.now();
            sql += `(title, text, category_id, author_id, date) VALUES ('${params.title}', '${params.text}',
            '${params.categoryId}', '${params.authorId}', '${now}');`;
            break;
        case `categories`:
            sql += `(title) VALUES('${params.title}');`;
            break;
        case `users`:
            let now = Date.now();
            sql += `(first_name, last_name, password, email, signup_date, login_date) VALUES ('${params.firstName}', '${params.lastName}',
            '${params.email}', '${now}', '0');`;
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

// Intended usage on insert, update and remove methods
function hasPermissions(table, method, userId, params) {
    let reqPermission = 3;
    switch (table) {
        case 'posts':
            reqPermission = 1;
            break;
        case 'users':
            if ((userId == false && 
                method == 'INSERT') || 
                (params.id == userId && 
                method == 'UPDATE')) {
                return true;
            }
            break;
        case 'categories':
            reqPermission = 1;
        case 'comments':
            // ToDo: Allow user to delete/update own commentaries
            break;
    }

    if (userId == false) {
        return false;
    }

    db.get(`SELECT permissions FROM users WHERE id = ${userId};`,
    (err, row) => {
        if (err != null ||
            row == undefined) {
            return false;
        }
        else {
            if (row['permissions'] >= reqPermission) {
                return true;
            }
        }
    });
    return false;
}

const model = {
    selectData: (table, next) => {
        // Validity check, prevent execution of a query if false    
        if (!containsValidInput(table, next.request.params)) {
            next.handleRequest(next.request, next.respond, {'result':'Failed!', 
            'reason':'input compliance fallthrough'}, null);
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
        if (table == 'users') {
            if (!('email' in next.request.body) ||
                !('password' in next.request.body) ||
                !('firstName' in next.request.body) ||
                !('lastName' in next.request.body)) {
                next(req, res, {'result': 'Failed!', 'reason':'Invalid input!'}, null);
                return;
            }
            for (let i of req.body) {
                if (req.body[i].length < 3) {
                    next(req, res, {'result': 'Failed!', 'reason':'Invalid input!'}, null);
                    return;
                }
            }
        }

        if (!hasPermissions(table, 'INSERT', ('userId' in next.request.session ? next.request.session.userId : false), next.request.body)) {
            next.handleRequest(next.request, next.respond, 
            {'result':'Failure!', 'reason':'You do not have the required permissions!'}, 
            null);
            return;
        }
        // Validity check, prevent execution of a query if false  
        if (!containsValidInput(table, next.request.body)) {
            next.handleRequest(next.request, next.respond, {'result':'Failed!', 
            'reason':'input compliance fallthrough'}, null);
            return;
        }
        let sql = createInsertStatmentBasedOnTableName(table, next.request.body);
        db.run(sql, (err) => {
            if (err != null) {
                next.handleRequest(next.request, next.respond, 
                { result: `Failure!` }, null);
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
        if (('id' in next.request.body)) {
            next.handleRequest(next.request, next.respond, 
            {'result':'Failed!', 'reason':'cannot include id in post method'}, 
            null);
            return;
        }
        if (!hasPermissions(table, 'REMOVE',
           ('userId' in next.request.session ? next.request.session.userId : false),
            next.request.params)) {
            next.handleRequest(next.request, next.respond, 
            {'result':'Failure!', 'reason':'You do not have the required permissions!'}, 
            null);
            return;
        }
        // Validity check, prevent execution of a query if false
        if (!containsValidInput(table, next.request.params)) {
            next.handleRequest(next.request, next.respond,
            {'result':'Failed!', 'reason':'input compliance fallthrough'}, null);
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
        if (('id' in next.request.body)) {
            next.handleRequest(next.request, next.respond, 
            {'result':'Failed!', 'reason':'cannot include id in post method'}, 
            null);
            return;
        }
        if (!hasPermissions(table, 'INSERT',
           ('userId' in next.request.session ? next.request.session.userId : false),
            next.request.params)) {
            next.handleRequest(next.request, next.respond, {'result':'Failure!',
             'reason':'You do not have the required permissions!'}, null);
            return;
        }
        // Validity check, prevent execution of a query if false
        if (!containsValidInput(table, next.request.body)) {
            next.handleRequest(next.request, next.respond, 
            {'result':'Failed!', 'reason':'input compliance fallthrough'},
             null);
            return;
        }
        let sqlSet = createUpdateStatementBasedOnTableName(table, next.request.body, next.request.params.id);
        db.run(sqlSet, (err) => {
            if (err != null) {
                next.handleRequest(next.request,next.respond,{ result: `Failed!` }, null);
                console.error(`${table}: Could not complete UPDATE operation!`);
                console.error(err.message);
            }
            else {
                next.handleRequest(next.request,next.respond,{ result: `Success!` }, null);
                console.log(`${table}: Completed UPDATE operation!`);
            }
        });
    },
    userLogin: (req, res, next) => { 
        if ((!('email' in req.body) && !('password' in req.body)) || 
            (req.body.email.length < 3 || req.body.password.length < 3)) {
            next(req, res, {'result': 'Failed!', 'reason':'Invalid input!'}, null);
            return;
        }
        // Check validity of the data
        if (!containsValidInput('users', req.body)) {
            next(next.request, next.respond,
            {'result':'Failed!', 'reason':'input compliance fallthrough'},
             null);
            return;
        }
        db.get(`SELECT id, password FROM users WHERE email = ${req.body.email}`, (err, row) => {
            if (err) {
                console.error("An DB error has occured executing userLogin");
                console.error(err.message);
            }
            else {
                if (row == undefined || row['password'] != req.body['password']) {
                   next(req, res, { 'result' : 'Failed!', 'reason' : 'Invalid email/password' }, null);
                }
                else {
                    req.session.userId = row['id'];
                    req.session.save(err => {
                        if (err) {
                            console.error("Couldnt save session on userLogin!");
                            console.error(err.message);
                        }
                    });
                }
            }
        });
    }
};

module.exports = model;
