CREATE DATABASE virtuallyDB; -- because you can get virtually anything at a great price

USE virtuallyDB;

CREATE TABLE customers (
	id INT AUTO_INCREMENT,
	name VARCHAR(50) NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE shopping_carts (
	cart_id INT AUTO_INCREMENT,
	customer_id INT NOT NULL,
	invoice_id DECIMAL (8, 2),
	PRIMARY KEY (cart_id)
);

CREATE TABLE cart_items (
	cart_id INT NOT NULL,
	product_id INT NOT NULL,
	product_id_quantity INT DEFAULT 1
);

CREATE TABLE products (
	item_id INT AUTO_INCREMENT,
	product_name VARCHAR(150) NOT NULL,
	department_id INT(5),
	price DECIMAL(7, 2),
	stock_quantity INT(5),
	PRIMARY KEY (item_id);	
); 

CREATE TABLE departments (
	department_id INT(5) AUTO_INCREMENT,
	department_name VARCHAR(75) NOT NULL,
	over_head_costs DECIMAL(9, 2),
	total_sales DECIMAL(9,2),
	PRIMARY KEY (department_id)
);