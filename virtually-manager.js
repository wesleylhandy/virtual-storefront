const mysql = require("mysql");
const prompt = require("prompt");
const colors = require("colors/safe");
const Table = require('cli-table');
const commons = require('./common-store-functions.js');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'applications',
  password : 'runningfromnode',
  database : 'virtuallyDB'
});

const storeName = colors.rainbow("Virtually");

var delay;

connection.connect((err)=> {
	if (err) throw err;

	commons.logTitle();

	console.log("");
	console.log("- MANAGER INTERFACE -");
	console.log("");

	getManagerAction();

});

function getManagerAction() {

	displayMenu();
	
	prompt.message = storeName + " - MANAGER ";
	prompt.delimiter = colors.magenta(" -> ");
	prompt.start();

	var property = {
    	name: 'id',
    	type: 'integer',
    	minimum: 1,
      	maximum: 5,
        message: colors.yellow("Enter the Id of the Action you want to take."),
        warning: 'Must be a valid ID number.',
        required: true 
	}

	//ask user to select item to purchase
	prompt.get(property, function(err, action) {

		switch (action.id) {
			case 1 :		
				viewProducts();
				break;

			case 2 :
				viewLowInventory();
				break;

			case 3 :
				addInventory();
				break;

			case 4 :
				addProduct();			
				break;

			case 5 :
				connection.destroy();
				commons.exitStore();
				break;
		}
	});

}

//show manager action menu
function displayMenu() {

	var headers = ["Option", "Manager Action"];

	var actions = [
		[1, "View Products for Sale"], 
		[2, "View Low Inventory"], 
		[3, "Add to Inventory"],
		[4, "Add New Product"],
		[5, "Exit Program"]
	]

	// instantiate 
	var menu = new Table({
	    head: headers,
	    colWidths: [10, 75]
	});

	actions.forEach((e)=>{
		menu.push(e);
	});

	console.log(menu.toString());
}

/*****************************************/
/********* MANAGER LEVEL ACTIONS *********/
/*****************************************/

function viewProducts() {

	console.log(colors.green("Displaying All Products..."));

	commons.queryAllProducts().then((data)=>{

		commons.displayProducts(data);
		delay = setTimeout(getManagerAction, 1500);

	}).catch((err)=>{if(err) console.log(err);});
}

function viewLowInventory() {

	console.log(colors.green("Displaying Products with Low Inventory..."));

	queryProductsWithLowInventory().then((data)=>{

		commons.displayProducts(data);
		delay = setTimeout(getManagerAction, 1500);

	}).catch((err)=>{if(err) console.log(err);});
}

function addInventory() {
	commons.queryAllProducts().then((data)=>{

		console.log(colors.green("Let's Update Our Inventory..."));

		prompt.message = storeName + " - MANAGER ";
		prompt.delimiter = colors.magenta(" -> ");
		prompt.start();

		prompt.get({
			properties: {
			    id: { 
			    	type: 'integer',
			    	minimum: 1,
			        message: colors.yellow("Enter the Id of the Product whose Quantity you want to update:"),
			        warning: 'Must be a valid ID number.',
			        required: true }, 
			    quantity: { 
			    	type: 'integer',
		      		minimum: 1,
		      		message: colors.green("Enter the Quantity you wish to add to the current inventory:"),
		      		warning: 'Must be a number greater than 0.',
		      		required: true 
		      	}
		    }
	    }, function (err, update) {

	    	var original, updated;
	    	data.forEach((e)=> {
	    		if (e.id == update.id) {
	    			original = parseInt(e.quantity);
	    			updated = original + update.quantity;
	    		}
	    	});

	    	commons.updateQuantityOfSingleItem(updated, update.id).then((res)=>{

	    		console.log("SUCCESS");
	    		delay = setTimeout(getManagerAction, 1500);

	    	}).catch((err)=>{if(err) console.log(err);});

	    });

	}).catch((err)=>{if(err) console.log(err);});
}

function addProduct() {

	console.log("Let's Add A New Product to Our Inventory...");

	prompt.message = storeName + " - MANAGER ";
	prompt.delimiter = colors.magenta(" -> ");
	prompt.start();

	prompt.get({
		properties: {
		    item: { 
		        message: colors.yellow("Enter the Name of New Product:"),
		        required: true }, 
		    quantity: { 
		    	type: 'integer',
	      		minimum: 1,
	      		message: colors.green("Enter the Quantity of the New Product:"),
	      		warning: 'Must be an integer greater than 0.',
	      		required: true },
	      	price: {
	      		type: 'number',
	      		minimum: 0.01,
	      		message: colors.magenta("Enter the Price Point for the New Product:"),
	      		warning: 'Must be number greater that 0.01.',
	      		required: true
	      	}
	    }
    }, function (err, add) {


		var item = {
			product_name: add.item,
			department_id: 6,
			price: add.price,
			stock_quantity: add.quantity
		}

		insertNewProduct(item).then((res)=>{

			console.log("SUCCESS");

			delay = setTimeout(getManagerAction, 1500);

		}).catch((err)=>{if(err) console.log(err);});

	});
}

/*****************************************/
/********* MANAGER LEVEL QUERIES *********/
/*****************************************/

function queryProductsWithLowInventory() {
	return new Promise((resolve, reject)=> {
		connection.query("SELECT item_id AS id, product_name AS item, price, stock_quantity AS quantity, department_name AS department FROM products INNER JOIN departments ON products.department_id = departments.department_id WHERE stock_quantity < 5 ORDER BY id", (err,res) => {
			if (err) {reject(err);} else {resolve(res);}
		});
	});
}

function insertNewProduct(newItem) {
	return new Promise((resolve, reject)=> {
		connection.query("INSERT INTO products SET ?", newItem, (err,res) => {
			if (err) {reject(err);} else {resolve('Success');}
		});
	});
}