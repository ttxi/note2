let http = require('http');
// let mysql = require('mysql');
// let connection = mysql.createConnection({
//   host: 'db',
//   user: 'xitiantian',
//   password: 123456,
//   database: 'node',
// });

// connection.connect();
let server = http.createServer((req, res) => {
  res.end('2');
  // connection.query('select 1+1 as solution', function (err, result) {
  //   res.end('' + result[0].solution);
  // });
});

server.listen(3000);
