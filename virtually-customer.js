const mysql = require("mysql");
const prompt = require("prompt");
var colors = require("colors/safe");
const Table = require('cli-table');

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
	
	logTitle();

	delay = setTimeout(openStoreForBusiness, 2500);
	
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

function openStoreForBusiness() {

	queryAllProducts().then((data)=> {

		displayProducts(data);

		prompt.message = storeName;
		prompt.delimiter = colors.magenta(" -> ");
		prompt.start();

		prompt.get({
		    properties: {
				    id: {
				    	type: 'integer',
				      	maximum: parseInt(data[data.length-1].id),
				        description: colors.yellow("Enter the Id of the Item you want to purchase"),
				        required: true
				    },
				      quantity: {
				      	type: 'integer',
				      	minimum: 1,
				      	description: colors.green("Enter the quantity of the Item for your order"),
				      	required: true
				    }
		    	}
		  	}, function (err, result) {

			  	let index = parseInt(result.id) -1; //to get index of the data array

			    console.log(colors.cyan(`You said you wanted to purchase: ${result.quantity} unit(s) of ${data[index].item}`));
			    
			    var available = parseInt(data[index].quantity);

		    	if (available < parseInt(result.quantity)) {

		    		console.log(colors.underline.red(`I'm sorry, but we are ${storeName} out of stock for this item. Try reducing your order quantity.`));

		    		delay = setTimeout(openStoreForBusiness, 2000); //display items again

		    	} else {

		    		//calculate total purchase price
		    		let totalPrice = parseInt(result.quantity) * parseFloat(data[index].price);

		    		console.log(colors.underline(`You have just purchased ${result.quantity} unit(s) of ${data[index].item} for $${totalPrice}`));
		    		
		    		available-= parseInt(result.quantity);

		    		updateQuanityOfSingleItem(available, result.id).then((res)=>{
		    			
		    			delay = setTimeout(openStoreForBusiness, 2000);

		    		}).catch((err)=>{if (err) console.log(err)});
		    	}

	 	});

	}).catch((err)=> {if (err) console.log(err)});

}

function queryAllProducts() {
	return new Promise((resolve, reject)=> {
		connection.query("SELECT item_id AS id, product_name AS item, price, stock_quantity AS quantity, department_name AS department FROM products INNER JOIN departments ON products.department_id = departments.department_id WHERE stock_quantity > 0 ORDER BY id", (err,res) => {
			if (err) {reject(err);} else {resolve(res);}
		});
	});
}

function displayProducts(data) {
	var headers = ["Id", "Item", "Price", "Department"];

	// instantiate 
	var table = new Table({
	    head: headers,
	    colWidths: [5, 48, 8, 40]
	});

	data.forEach((e)=> {
		let arr = [e.id, e.item, e.price, e.department];
		table.push(arr);
	});

	console.log(table.toString());
}

function updateQuanityOfSingleItem(quantity, id) {
	return new Promise((resolve, reject)=> {
		connection.query("UPDATE products SET ? WHERE ? LIMIT 1", [{stock_quantity: quantity}, {item_id: id}], (err,res) => {
			if (err) {reject(err);} else {resolve(res);}
		});
	});
}