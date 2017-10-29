var mysql = require('mysql');
var Promise = require("bluebird");

Promise.promisifyAll(mysql);
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);

var pool = mysql.createPool({
    host: 'us-cdbr-iron-east-05.cleardb.net',
    user: 'bf32bf5a7a9eae',
    password: '966fbda0',
    database: 'heroku_7be18966ed8d82e'
});

function getSqlConnection() {
    return pool.getConnectionAsync().disposer(function (connection) {
        console.log("Realizando la conexión")
        connection.release();
    });
}

function querySql (query, params) {
    return Promise.using(getSqlConnection(), function (connection) {
        console.log("Se ha establecido la conexión");
        if (typeof params !== 'undefined'){
            return connection.queryAsync(query, params);

        } else {
          return connection.queryAsync(query);
        }
    });

};

module.exports = {
    getSqlConnection : getSqlConnection,
    querySql : querySql,
    secret: 'yourSecret'
};
