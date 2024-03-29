create table user (
    id int primary key AUTO_INCREMENT,
    name varchar(250),
    contactNumber varchar(20),
    email varchar(50),
    password varchar(250),
    status varchar(20),
    role varchar(20),
    UNIQUE (email)
);

insert into user(name,contactNumber,email,password,status,role) values('Admin',"9865221997","mmadan3600@gmail.com","admin","true","admin");

create table category (
    id int NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    primary ke(id)
)
create table product(
    id int NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    categoryId integer NOT NULL,
    description varchar(255) NOT NULL,
    price integer,
     status varchar(25),
     primary key
)

create table orders(
    order_id int NOT NULL AUTO_INCREMENT,
    order_name varchar(255) NOT NULL,
    payment_method varchar(255) NOT NULL,
    total_amount DECIMAL(10,2),
     status varchar(25),
     primary key(order_id)
);

create table order_items(
    id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_name varchar(255),
    product_id INT,
    quantity INT,
    price integer,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);