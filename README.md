# virtual-storefront
Node.js App that creates a command-line storefront built on mysql, prompt, colors, and cli-table npm packages.

## Installation Instructions

1. Fork this repo and clone the forked repo to your computer.
2. Run `npm install`
3. Install mysql on your machine, if necessary -> https://www.mysql.com/
4. Set up your own localhost connection. In each of the `.js` files in this repo, update the connection settings as follows:

```javascript
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : <enter your user information>,
  password : <enter your password>,
  database : 'virtuallyDB'
});
```

5. In mysql Workbench, import `schema.sql` and `database-seeds.sql` from this repo and run them to upload the db onto your localhost.
6. From the command-line, 
	* To interact as a customer, run `virtually-customer.js` to make virtually purchases, and follow the prompts on-screen.
	* To update products and add quantity, as would a manager, run `virtually-manager.js` and follow the prompts on-screen.
	* To evaluate whole departments and to add new departments, as would a supervisor, run `virtually-supervisor.js` and follow the prompts on-screen.