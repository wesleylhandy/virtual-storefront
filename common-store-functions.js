const mysql = require("mysql");
const Table = require('cli-table');
const colors = require("colors/safe");
const storeName = colors.rainbow("Virtually");

var connection = mysql.createConnection({
  	host     : 'localhost',
  	user     : 'applications',
  	password : 'runningfromnode',
  	database : 'virtuallyDB'
});

function logTitle() {
	console.log("");
	console.log(colors.red('_________________________________________________________________________________________________________'));
	console.log("");
	var tildas = colors.yellow('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
	var tagline = colors.magenta("All You Ever Wanted");
	console.log(`${tildas} ${storeName} ${tagline} ${tildas}`);
	console.log("");
	console.log(colors.red('_________________________________________________________________________________________________________'));
	console.log("");
}

function displayProducts(data) {
	var headers = ["Id", "Item", "Price", "Available"];

	// instantiate 
	var table = new Table({
	    head: headers,
	    colWidths: [5, 75, 8, 10]
	});

	data.forEach((e)=> {
		var quantity;
		if (e.quantity == 0) {
			quantity = colors.red(e.quantity);
		} else if (e.quantity < 5) {
			quantity = colors.yellow(e.quantity);
		} else {
			quantity = colors.green(e.quantity);
		}
		let arr = [e.id, e.item, e.price, quantity];
		table.push(arr);
	});

	console.log(table.toString());
}

function queryAllProducts() {
	return new Promise((resolve, reject)=> {
		connection.query("SELECT item_id AS id, product_name AS item, price, stock_quantity AS quantity, products.department_id AS department_id, department_name AS department FROM products INNER JOIN departments ON products.department_id = departments.department_id ORDER BY id", (err,res) => {
			if (err) {reject(err);} else {resolve(res);}
		});
	});
}

function updateQuantityOfSingleItem(quantity, id) {
	return new Promise((resolve, reject)=> {
		connection.query("UPDATE products SET ? WHERE ? LIMIT 1", [{stock_quantity: quantity}, {item_id: id}], (err,res) => {
			if (err) {reject(err);} else {resolve(res);}
		});
	});
}

function updateTotalSales(id, newSale) {
	
	getSingleDepartment(id).then((data)=>{

		var currentTotal = data[0].total_sales;
		var newTotal = currentTotal + newSale;

		connection.query("UPDATE departments SET ? WHERE ? LIMIT 1", [{total_sales: newTotal}, {department_id: id}], (err, res)=>{
			if(err) console.log(err);
		});
	}).catch((err)=>{if (err) console.log(err);});
		
}

function getSingleDepartment(id) {
	return new Promise((resolve, reject)=> {
		connection.query("SELECT * FROM departments WHERE ? LIMIT 1", {department_id: id}, (err,res) => {
			if (err) {reject(err);} else {resolve(res);}
		});
	});
}

exports.updateQuantityOfSingleItem = updateQuantityOfSingleItem;
exports.queryAllProducts = queryAllProducts;
exports.displayProducts = displayProducts;
exports.logTitle = logTitle;
exports.updateTotalSales = updateTotalSales;