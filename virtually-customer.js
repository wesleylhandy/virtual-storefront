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

	delay = setTimeout(openStoreForBusiness, 1500);
	
});


function openStoreForBusiness() {

	//get list of products from the database - returns a promise
	commons.queryAllProducts().then((data)=> {

		//use npm cli-table to display products
		commons.displayProducts(data);

		getCustomerOrder(data);

	}).catch((err)=> {if (err) console.log(err)});

}

function getCustomerOrder(data) {
	//initialize prompt
	prompt.message = storeName;
	prompt.delimiter = colors.magenta(" -> ");
	prompt.start();

	//ask user to select item to purchase
	prompt.get({
		properties: {
		    id: { 
		    	type: 'integer',
		    	minimum: 0,
		      	maximum: parseInt(data[data.length-1].id),
		        message: colors.yellow("Enter the Id of the Item you want to purchase. (Enter 0 to exit after prompts)"),
		        warning: 'Must be a valid ID number.',
		        required: true }, 
		    quantity: { 
		    	type: 'integer',
	      		minimum: 1,
	      		message: colors.green("Enter the quantity of the Item for your order"),
	      		warning: 'Must be a number greater than 0.',
	      		required: true }
	      	}
	    }, function (err, result) {

    	if (result.id == 0) {

    		exitStore();
    	
    	} else {

		  	commons.querySingleProduct(result.id).then((product)=>{

		  		var item = product[0].product_name;

			    console.log(colors.cyan(`You said you wanted to purchase: ${result.quantity} unit(s) of ${item}`));
			    
			    //initialize new prompt to customer
			    prompt.start();

				var property = {
					name: 'yesno',
					message: 'Are you sure (y/n)?',
					validator: /[y]|[n]/,
					warning: 'Must respond y or n',
				};
				//confirm customer purchase
				prompt.get(property, function (err, confirm) {

					function startAgain() {
						getCustomerOrder(data);
					}

				  	//if customer cancels purchase, go back to initial prompt, else perform other checks
					if (confirm.yesno == 'n') {
						console.log(colors.underline.green(`OK. Let's start Over.`));
						delay = setTimeout(startAgain, 1500);
					} else {

						//set item quantity to variable for comparisons
					    var available = product[0].stock_quantity;

					    //make sure there is enough quantity of this item. If not, go back to initial prompt.
				    	if (available < parseInt(result.quantity)) {

				    		console.log(colors.underline.red(`I'm sorry, but we are ${storeName} out of stock for this item. Try reducing your order quantity.`));

				    		delay = setTimeout(startAgain, 1500); //display items again

				    	} else {

				    		//calculate total purchase price, show to customer, reduce quantity and update db
				    		var totalPrice = parseInt(result.quantity) * parseFloat(product[0].price);
				    		console.log(colors.underline(`You have just purchased ${result.quantity} unit(s) of ${item} for $${totalPrice}`));
				    		available-= parseInt(result.quantity);
				
				    		commons.updateQuantityOfSingleItem(available, result.id).then((res)=>{

				    			commons.updateTotalSales(product[0].department_id, totalPrice);
				    			//after update, call open store for business to update item list
		  			   			delay = setTimeout(openStoreForBusiness, 2000);
				    		}).catch((err)=>{if (err) console.log(err)});
				    	}
				    }
			    });
			}).catch((err)=>{if (err) console.log(err)});
		}
 	});
}

function exitStore() {

	connection.destroy();
}