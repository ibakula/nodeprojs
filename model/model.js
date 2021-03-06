const sqlite = require('sqlite3').verbose();
const errorHandler = require('./errorHandler');
const db = new sqlite.Database('./database/news.db', errorHandler.handleDbOpen);
const md5 = require('md5');

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
    'title' : 'string',
    'img' : 'string'
};

const commentsStruct = {
    'id' : 'number',
    'postId' : 'number',
    'userId' : 'number',
    'text' : 'string',
    'date' : 'string',
    'lastEdit' : 'string'
}

const subscriberStruct = {
    'id' : 'number',
    'email' : 'string'
}

function escapeSpecificCharacters(term) {
  let sentence = term;
  let escapees = '\'';
  for (let i = 0; i < escapees.length; ++i) {
    let pos = sentence.search(escapees.charAt(i));
    if (pos != -1) {
      let lastPos = 0;
      let part = "";
      while (pos != -1) {
       sentence = sentence.slice(0, lastPos+pos) + (i == 0 ? '\'' : '\\') + sentence.slice(lastPos+pos);
       lastPos += pos+2;
       part = sentence.slice(lastPos);
       pos = part.search(escapees.charAt(i));
      }
    }
  }
  return sentence;
}

function separateTermsForSqlQuery(term, table, fromId = -1, toId = -1, countLimit = 10) {
  let nextPos = -1;
  let termArr = [];
  let params = {};
  switch (table) {
    case 'users':
      params.firstName = "";;
      params.lastName = "";
      break;
    case 'posts':
      params.title = "";
      params.text = "";
      break;
    case 'category':
      params.title = "";
      break;
    case 'comments':
      params.text = "";
      break;
  }
 
  let sql = `SELECT * FROM ${table} WHERE `;
  for (let item in params) {
    if (term.length > 70) {
      let item2 = item;
      if (item2.endsWith("Name")) {
        item2 = item2.replace("Name", "_name");
      }
      sql += `${item2} LIKE '%${term}%' OR `;
      continue;
    }
    let term2 = term;
    do {
      nextPos = term2.search(" ");
      let word = term2.slice(0, (nextPos != -1 ? nextPos : term2.length))
      let item2 = item;
      if (item2.endsWith("Name")) {
        item2 = item2.replace("Name", "_name");
      }
      term2 = term2.slice(nextPos+1, term2.length);
      sql += `${item2} LIKE '%${word}%' ` + (table == 'users' ? 'OR ' : 'AND ');
    } while (nextPos != -1);   
    sql = sql.slice(0, (sql.length-(table == 'users' ? 4 : 5)));
    sql += ' OR ';
  }
  sql = sql.slice(0, (sql.length-4));

  if (toId != -1) {
    sql += ` AND id < ${toId}`;
  }

  if (fromId != -1) {
    sql += ` AND id > ${fromId}`;
  }
  else {
    sql += ` ORDER BY id DESC`;
  }
  sql += ` LIMIT ${countLimit};`;
  return sql;
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
        case 'subscribers':
            struct = subscriberStruct;
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

function createInsertStatmentBasedOnTableName(table, params, userId = null) {
    let sql = `INSERT INTO ${table} `;
    let now = Date.now();

    switch (table) {
        case `posts`:
            let title = escapeSpecificCharacters(params.title);
            let text = escapeSpecificCharacters(params.text);
            sql += `(title, text, category_id, author_id, views, date) VALUES ('${title}', '${text}',
            '${params.categoryId}', '${userId}', '0', '${now}');`;
            break;
        case `categories`:
            sql += `(title, img) VALUES('${params.title}', '${params.img}');`;
            break;
        case `users`:
            let password = md5(params.password);
            sql += `(first_name, last_name, password, email, signup_date, login_date)
            VALUES ('${params.firstName}', '${params.lastName}', '${password}', '${params.email}', '${now}', '0');`;
            break;
        case 'comments':
            sql += `(post_id, user_id, text, date, last_edit) VALUES ('${params.postId}', '${params.userId}', '${params.text}', '${now}', '0');`;
            break;
        case 'subscribers':
            sql += `(email) VALUES ('${params.email}');`;
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
            let password = null;
            if ('password' in params) {
                password = md5(params.password);
            }
            sqlSet += ('firstName' in params ? `first_name = '${params.firstName}', ` : '') +
            ('lastName' in params ? `last_name = '${params.lastName}', ` : '') +
            ('password' in params ? `password = '${password}', ` : '') +
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
    
    sqlSet += `WHERE id = '${id}';`;
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
        case 'subscribers':
            reqPermission = 0;
            break;
    }

    if (session == false && reqPermission > 0) {
        return false;
    }

    return (session != false ? (session.permissions >= reqPermission) : (0 >= reqPermission));
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
    findInTable: (req, res, table, next) => {
        if (!('term' in req.body)) {
            next(req, res, {'result':'Failed!',
            'reason':'input compliance fallthrough'}, null);
            return;
        }
        // Validity function passed params 
        //are intentionally contrived and fully valid
        let params = { 'text' : req.body.term };
        if (!containsValidInput('posts', params)) {
          next(req, res, {'result':'Failed!',
          'reason':'input compliance fallthrough'}, null);
          return;
        }
        
        let term2 = escapeSpecificCharacters(req.body.term);
        let sql = separateTermsForSqlQuery(term2, table, req.params.fromId, req.params.toId, req.params.countLimit);

        db.all(sql, 
          (err, rows) => {
              if (err) {
                console.error("DB Error: couldnt fetch table data.");
                console.error(err.message);
                next(req, res, { 'result' : 'Failed' }, null);
              }
              else {
                  if (rows && rows.length > 0) {
                      next(req, res, (req.params.fromId != null ? rows.reverse() : rows), null);
                  }
                  else {
                      next(req, res, [], null);
                  }
              }
        });
    },
    getMatchesCount: (req, res, table, next) => {
        if (!('term' in req.body)) {
            next(req, res, {'result':'Failed!',
            'reason':'input compliance fallthrough'}, null);
            return;
        }
        // Validity function passed params 
        //are intentionally contrived and fully valid
        let params = { 'text' : req.body.term };
        if (!containsValidInput('posts', params)) {
          next(req, res, {'result':'Failed!',
          'reason':'input compliance fallthrough'}, null);
          return;
        }

        let term2 = escapeSpecificCharacters(req.body.term);
        let sql = separateTermsForSqlQuery(term2, table);
        sql = sql.replace("SELECT *", "SELECT COUNT(*)");
        let pos = sql.search("ORDER BY");
        if (pos != -1) {
            sql = sql.slice(0, (pos-1)) + ";";
        }
        
        db.get(sql, 
            (err, row) => {
                if (err) {
                    next(req, res, { count: 0 }, null);
                }
                else {
                    next(req, res, { count: row["COUNT(*)"] }, null);
                }
            });
    },
    getCommentsCountByPostId: (req, res, next) => {
        // Validity check, prevent execution of a query if false
        if (!containsValidInput('comments', req.params)) {
            next.handleRequest(req, res, {'result':'Failed!',
            'reason':'input compliance fallthrough'}, null);
            return;
        }
        
        db.get(`SELECT COUNT(*) FROM comments WHERE post_id = '${req.params.postId}';`, 
        (err, row) => {
            if (err) {
                next(req, res, { count: 0 }, null);
            }
            else {
                next(req, res, { count: row["COUNT(*)"] }, null);
            }
        });
    },
    selectCommentsDataByPostId: (req, res, next) => {
        // Validity check, prevent execution of a query if false
        if (!containsValidInput('comments', req.params)) {
            next.handleRequest(req, res, {'result':'Failed!',
            'reason':'input compliance fallthrough'}, null);
            return;
        }

        let sql = `SELECT * FROM comments WHERE post_id = '${req.params.postId}' `;
        if ('fromCommentId' in req.params) {
            if (req.params.fromCommentId != 0) {
                sql += `AND id > ${req.params.fromCommentId} `;
            }
            else {
                sql += "ORDER BY id DESC ";
            }
        }
        
        if ('toCommentId' in req.params) {
            sql += `AND id < ${req.params.toCommentId} ORDER BY id DESC `;
        }
        
        if ('countLimit' in req.params) {
            sql += `LIMIT ${req.params.countLimit};`;
        }
        else {
            sql += `LIMIT 10;`;
        }
        
        db.all(sql, 
          (err, rows) => {
              if (err) {
                console.error("DB Error: couldnt fetch comments data by posts id.");
                console.error(err.message);
                next(req, res, { 'result' : 'Failed' }, null);
              }
              else {
                  if (rows && rows.length > 0) {
                      next(req, res, req.params.fromCommentId == 0 || 'toCommentId' in req.params ? rows : rows.reverse(), null);
                  }
                  else {
                      next(req, res, [], null);
                  }
              }
        });
    },
    selectDataEnd: (table, next) => {
        db.get(`SELECT id FROM ${table} ORDER BY id DESC LIMIT 1;`, (err, row) => {
            if (err) {
                console.error("DB Error couldnt fetch post from end!");
                console.error(err.message);
                next.handleRequest(next.request, next.respond,
                {'result':'Failed!'}, null);
            }
            else {
                if (row) {
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
        // ToDo: add permissions check, example: userId 1 can change data for column matching userId 2
        // Validity check, prevent execution of a query if false
        if (!containsValidInput(table, next.request.params)) {
            next.handleRequest(next.request, next.respond, {'result':'Failed!', 
            'reason':'input compliance fallthrough'}, null);
            return;
        }
        let columns = (table == 'users' ? 'id, first_name, last_name, email, permissions, signup_date' : '*');
        db.all(`SELECT ${columns} FROM ${table} WHERE id = ${next.request.params.id};`, (err, rows) => {
            if (err != null) {
                next.handleRequest(next.request, next.respond, [], null);
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
            if (next.request.body['email'].length < 5 || next.request.body['password'] < 3) {
                next.handleRequest(next.request, next.respond, 
                {'result': 'Failed!', 'reason':'Invalid input!'}, 
                null);
                return;
            }
        }

        if (!hasPermissions(table, 'INSERT', ('userId' in next.request.session ? next.request.session : false), next.request.body)) {
            next.handleRequest(next.request, next.respond, 
            {'result':'Failed!', 'reason':'You do not have the required permissions!'}, 
            null);
            return;
        }
        // Validity check, prevent execution of a query if false  
        if (!containsValidInput(table, next.request.body)) {
            next.handleRequest(next.request, next.respond, {'result':'Failed!', 
            'reason':'input compliance fallthrough'}, null);
            return;
        }
        
        let sql = createInsertStatmentBasedOnTableName(table, next.request.body, next.request.session.userId);
        db.run(sql, (err) => {
            if (err != null) {
                next.handleRequest(next.request, next.respond, 
                { result: `Failed!` }, null);
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
            {'result':'Failed!', 'reason':'You do not have the required permissions!'}, 
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
        
        db.run(`DELETE FROM ${table} WHERE id = '${next.request.params.id}';`, (err) => {
            if (err != null) {
                next.handleRequest(next.request, next.respond, { result: `Failed!` }, null);
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
            next.handleRequest(next.request, next.respond, {'result':'Failed!',
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
        if (req.session && 'userId' in req.session) {
            next(req, res, {'result': 'Failed!', 'reason':'Log out first!'}, null);
            return;
        }
        if ((!('email' in req.body) || !('password' in req.body)) || 
            (req.body.email.length < 3 || req.body.password.length < 3)) {
            next(req, res, {'result': 'Failed!', 'reason':'Invalid input!'}, null);
            return;
        }
        // Check validity of the data
        if (!containsValidInput('users', req.body)) {
            next(req, res,
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
                let password = md5(req.body['password']);
                if (row == undefined || row['password'] != password) {
                    next(req, res, { 'result' : 'Failed!', 'reason' : 'Invalid email/password' }, null);
                    return;
                }
                else {
                    let date = Date.now();
                    req.session.userId = row['id'];
                    req.session.permissions = row['permissions'];
                    req.session.email = req.body.email;
                    req.session.firstName = row['first_name']
                    req.session.lastName = row['last_name'];
                    req.session.lastLogin = date;
                    req.session.save(err => {
                        if (err) {
                            console.error("Couldnt save session on userLogin!");
                            console.error(err.message);
                        }
                    });
                    db.run(`UPDATE users SET login_date = '${date}' WHERE id = '${row.id}';`, err => {
                      if (err) {
                        console.error("User login: could not save login date");
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
                id: req.session.userId, 
                permissions: req.session.permissions,
                first_name: req.session.firstName, 
                last_name: req.session.lastName, 
                email: req.session.email,
                last_login: req.session.lastLogin
             };
             next(req, res, userData, null);
        }
        else {
           next(req, res, undefined, null);
        }
    },
    getPopularPosts: (req, res, next) => {
        db.all("SELECT id, title, text, category_id, author_id, date FROM posts ORDER BY views ASC LIMIT 3;", 
            (err, rows) => { 
                if (err) {
                    console.error("DB Error: could not fetch popular posts!");
                    console.error(err.message);
                    next(req, res, {}, null);
                }
                else {
                    if (rows != undefined) {
                        next(req, res, rows, null);
                    }
                    else {
                        next(req, res, [], null);
                    }
                }
        });
    },
    getRecommendedPosts: (req, res, next) => {
        if (!containsValidInput('posts', req.params)) {
          next(req, res, {'result':'Failed!',
          'reason':'input compliance fallthrough'}, null);
          return;
        }
        db.all(`SELECT * FROM posts WHERE category_id = '${req.params.categoryId}' ORDER BY id DESC LIMIT 5`, (error, rows) => {
            if (error != null) {
                console.error("DB Error: could not fetch recommended posts!");
                console.error(error.message);
                next(req, res, {}, null);
                return;
            }
            next(req, res, rows, null);
        });
    }
};

module.exports = model;
