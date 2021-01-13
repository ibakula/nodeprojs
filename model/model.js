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
    'views' : 'number',
    'date' : 'string'
};

const categoriesStruct = {
    'id' : 'number', 
    'title' : 'string'
};

const commentsStruct = {
    'id' : 'number',
    'postId' : 'number',
    'userId' : 'number',
    'text' : 'string',
    'date' : 'string',
    'lastEdit' : 'string'
}

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
        case 'comments':
            struct = commentsStruct;
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
    let sql = `REPLACE INTO ${table} `;
    let now = Date.now();

    switch (table) {
        case `posts`:
            sql += `(title, text, category_id, author_id, views, date) VALUES ('${params.title}', '${params.text}',
            '${params.categoryId}', '${params.authorId}', '0', '${now}');`;
            break;
        case `categories`:
            sql += `(title) VALUES('${params.title}');`;
            break;
        case `users`:
            sql += `(first_name, last_name, password, email, signup_date, login_date)
            VALUES ('${params.firstName}', '${params.lastName}', '${params.password}', '${params.email}', '${now}', '0');`;
            break;
        case 'comments':
            sql += `(post_id, user_id, text, date, last_edit) VALUES ('${params.postId}', '${params.userId}', '${params.text}', '${now}', '0');`;
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
            sqlSet += ('firstName' in params ? `first_name = '${params.firstName}', ` : '') +
            ('lastName' in params ? `last_name = '${params.lastName}', ` : '') +
            ('email' in params ? `email = '${params.email}', ` : '') +
            ('signupDate' in params ? `signup_date = '${params.signupDate}', ` : '') +
            ('loginDate' in params ? `login_date = '${params.loginDate}' ` : '');
            break;
        case 'comments':
            sqlSet += ('text' in params ? `text = ${params.text}, last_edit = ${now}, ` : '');
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
function hasPermissions(table, method, session, params, callback = null) {
    let reqPermission = 3;
    switch (table) {
        case 'posts':
            reqPermission = 1;
            break;
        case 'users':
            if ((session == false && 
                method == 'INSERT') || 
                (params.id == session.userId && 
                method == 'UPDATE')) {
                return true;
            }
            break;
        case 'categories':
            reqPermission = 1;
            break;
        case 'comments':
            if (session != false) {
                return true;
            }
            break;
    }

    if (session == false) {
        return false;
    }

    return session.permissions >= reqPermission;
}

function handleCheckCommentAuthor(commentId, userId, permission, callback) {
    db.get(`SELECT user_id FROM comments WHERE id = '${commentId}';`, (err, row) => {
        if (err) {
            console.error("DB Error checking comment.");
            console.error(err.message);
        }
        else {
            if (row && 'user_id' in row && (row['user_id'] == userId ||
                permission >= 3)) {
                callback(commentId);
            }
        }
    });
}

const model = {
    selectDataEnd: (next) => {
        db.get("SELECT id FROM posts ORDER BY id DESC LIMIT 1;", (err, row) => {
            if (err) {
                console.error("DB Error couldnt fetch post from end!");
                console.error(err.message);
                next.handleRequest(next.request, next.respond,
                {'result':'Failed!'}, null);
            }
            else {
                if (row  && 'id' in row) {
                    next.handleRequest(next.request, next.respond,
                    row, null);
                }
                else {
                    next.handleRequest(next.request, next.respond, undefined, null);
                }
            }
        });
    },
    selectData: (table, next) => {
        // ToDo: make users table only select specific columns
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
        
        if (table == 'posts') {
            db.run(`UPDATE posts SET views = views + 1 WHERE id = '${next.request.params.id}'`,
            err => {
                if (err) {
                    console.err("There was an error incrementing views!");
                    console.err(err.message);
                }
            });
        }
    },
    insertData: (table, next) => {
        if (table == 'comments') {
            if (!('postId' in next.request.body &&
                'text' in next.request.body) &&
                'userId' in next.request.session &&
                !('userId' in next.request.body)) {
                next.handleRequest(next.request, next.respond, 
                {'result': 'Failed!', 'reason':'Invalid input or session!'}, 
                null);
                return;
            }
            next.request.body.authorId = next.request.session.userId;
        }
        
        if (table == 'users') {
            if (!('email' in next.request.body &&
                'password' in next.request.body &&
                'firstName' in next.request.body &&
                'lastName' in next.request.body)) {
                next.handleRequest(next.request, next.respond, 
                {'result': 'Failed!', 'reason':'Invalid input!'}, 
                null);
                return;
            }
            for (let i of req.body) {
                if (req.body[i].length < 3) {
                    next.handleRequest(next.request, next.respond, 
                    {'result': 'Failed!', 'reason':'Invalid input!'}, 
                    null);
                    return;
                }
            }
        }
        
        if (!hasPermissions(table, 'INSERT', ('userId' in next.request.session ? next.request.session : false), next.request.body)) {
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
    removeCommentHelperCallbackFn(commentId) {
        db.run(`DELETE FROM comments WHERE id = '${commentId}';`, (err) => {
            if (err != null) {
                console.error(`comments: Could not complete DELETE operation!`);
                console.error(err.message);
            }
            else {
                 console.log(`comments: Completed DELETE operation!`);
            }
        });
    },
    removeData: (table, next) => {
        if (!hasPermissions(table, 'REMOVE',
            ('userId' in next.request.session ? next.request.session : false),
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
        
        if (table == 'comments') {
            handleCheckCommentAuthor(next.request.params.id, 
            next.request.session.userId,
            next.request.session.permissions,
            model.removeCommentHelperCallbackFn);
            next.handleRequest(next.request, next.respond, { result: `Success!` }, null);
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
        if (!hasPermissions(table, 'UPDATE',
           ('userId' in next.request.session ? next.request.session : false),
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
        // ToDo add new login date on successful login
        if ((!('email' in req.body) || !('password' in req.body)) || 
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
        db.get(`SELECT id, first_name, last_name, password, permissions, login_date FROM users WHERE email = '${req.body.email}'`, (err, row) => {
            if (err) {
                console.error("An DB error has occured executing userLogin");
                console.error(err.message);
            }
            else {
                if (row == undefined || row['password'] != req.body['password']) {
                    next(req, res, { 'result' : 'Failed!', 'reason' : 'Invalid email/password' }, null);
                    return;
                }
                else {
                    req.session.userId = row['id'];
                    req.session.permissions = row['permissions'];
                    req.session.email = req.body.email;
                    req.session.firstName = row['first_name']
                    req.session.lastName = row['last_name'];
                    req.session.lastLogin = row['login_date'];
                    req.session.save(err => {
                        if (err) {
                            console.error("Couldnt save session on userLogin!");
                            console.error(err.message);
                        }
                    });
                }
            }
            next(req, res, {'result' : 'Success!'}, null);
        });
    },
    getUserStatus: (req, res, next) => {
        if (req.session && 'userId' in req.session) {
            let userData = { 
                userId: req.session.userId, 
                permissions: req.session.permissions,
                firstName: req.session.firstName, 
                lastName: req.session.lastName, 
                email: req.session.email,
                lastLogin: req.session.lastLogin
             };
             next(req, res, userData, null);
        }
        else {
           next(req, res, undefined, null);
        }
    }
};

module.exports = model;
