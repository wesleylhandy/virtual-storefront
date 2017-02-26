const mysql = require("mysql");
const prompt = require("prompt");
const Table = require('cli-table');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'applications',
  password : 'runningfromnode',
  database : 'virtuallyDB'
});

connection.connect((err)=> {
	if (err) throw err;
	console.log();
});