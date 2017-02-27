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
	console.log("- SUPERVISOR INTERFACE -");
	console.log("");

	getSupervisorAction();
});

function getSupervisorAction() {

	displayMenu();
	
	prompt.message = storeName + " - SUPERVISOR ";
	prompt.delimiter = colors.magenta(" -> ");
	prompt.start();

	var property = {
    	name: 'id',
    	type: 'integer',
    	minimum: 1,
      	maximum: 3,
        message: colors.yellow("Enter the Id of the Action you want to take."),
        warning: 'Must be a valid ID number.',
        required: true 
	}

	//ask user to select item to purchase
	prompt.get(property, function(err, action) {

		switch (action.id) {
			case 1 :		
				viewProductSalesByDepartment();
				break;

			case 2 :
				createNewDepartment();
				break;

			case 3 :
				connection.destroy();
				break;
		}
	});
}

//show supervisor action menu
function displayMenu() {

	var headers = ["Option", "supervisor Action"];

	var actions = [
		[1, "View Products Sales By Department"], 
		[2, "Create New Department"], 
		[3, "Exit Program"]
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
/******* SUPERVISOR LEVEL ACTIONS ********/
/*****************************************/

function viewProductSalesByDepartment() {
	console.log(colors.green("Displaying All Deparments..."));

	queryAllDeparments().then((data)=>{

		displayDepartments(data);

		delay = setTimeout(getSupervisorAction, 1500);

	});
}

function displayDepartments(data) {
	var headers = ["Id", "Name", "Overhead Costs", "Total Sales", "Total Profits"];

	// instantiate 
	var table = new Table({
	    head: headers,
	    colWidths: [5, 50, 15, 15, 15]
	});

	data.forEach((e)=> {
		var quantity;
		if (e.total_profits < 0) {
			profits = colors.red(e.total_profits);
		} else {
			profits = colors.green(e.total_profits);
		}
		let arr = [e.department_id, e.department_name, e.over_head_costs, e.total_sales, profits];
		table.push(arr);
	});

	console.log(table.toString());
}

function createNewDepartment() {

	console.log(colors.green("Let's Add A New Department to Our Store..."));

	prompt.message = storeName + " - SUPERVISOR ";
	prompt.delimiter = colors.magenta(" -> ");
	prompt.start();

	prompt.get({
		properties: {
		    department: { 
		        message: colors.yellow("Enter the Name of New Department:"),
		        required: true }, 
		    overhead: { 
		    	type: 'number',
	      		minimum: 0.01,
	      		message: colors.green("Enter the Overhead Costs of the New Department:"),
	      		warning: 'Must be an number greater than 0.',
	      		required: true 
	      	}
	    }
    }, function (err, add) {


		var department = {
			department_name: add.department,
			over_head_costs: add.overhead, 
			total_sales: 0.00
		}

		insertNewDepartment(department).then((res)=>{

			console.log("SUCCESS");

			delay = setTimeout(getSupervisorAction, 1500);

		}).catch((err)=>{if(err) console.log(err);});

	});
}

/*****************************************/
/******* SUPERVISOR LEVEL QUERIES ********/
/*****************************************/

function queryAllDeparments() {
	return  new Promise((resolve, reject)=> {
		connection.query("SELECT *, (total_sales - over_head_costs) AS total_profits FROM departments", (err,res) => {
			if (err) {reject(err);} else {resolve(res);}
		});
	});
}

function insertNewDepartment(newDepartment) {
	return new Promise((resolve, reject)=> {
		connection.query("INSERT INTO departments SET ?", newDepartment, (err,res) => {
			if (err) {reject(err);} else {resolve('Success');}
		});
	});
}