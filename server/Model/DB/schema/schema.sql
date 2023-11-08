-- select and create new DB
--remove db
DROP DATABASE IF EXISTS billingFCR;
CREATE DATABASE billingFCR;
USE billingFCR;

CREATE TABLE clients(
	client_id INTEGER AUTO_INCREMENT NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    PRIMARY KEY (client_id)
);

CREATE TABLE bills(
	bill_id INTEGER AUTO_INCREMENT NOT NULL,
    workDate DATE NOT NULL,
    date DATE NOT NULL,
    client_id INTEGER,
    bill_number VARCHAR(255) NOT NULL,
    PRIMARY KEY(bill_id),
    FOREIGN KEY (client_id) REFERENCES clients(client_id)
);

CREATE TABLE jobs(
	job_id INTEGER AUTO_INCREMENT NOT NULL,
    bill_id INTEGER,
    equipment_number VARCHAR(255) NOT NULL,
    PRIMARY KEY(job_id),
    FOREIGN KEY (bill_id) REFERENCES bills(bill_id)
);

CREATE TABLE work_items(
	work_id INTEGER AUTO_INCREMENT NOT NUll,
    job_id INTEGER,
    des VARCHAR(255) NOT NULL,
    note VARCHAR(255),
    price FLOAT NOT NULL,
    PRIMARY KEY(work_id),
    FOREIGN KEY (job_id) REFERENCES jobs(job_id)
);

CREATE INDEX idx_bill_id ON bills(bill_id);
CREATE INDEX idx_client_name ON clients(client_name);
CREATE INDEX idx_date ON bills(date);
CREATE INDEX idx_description ON work_items(des);
CREATE INDEX idx_notes ON work_items(note);

-- add a coloumn billname to bill
-- ALTER TABLE bills ADD COLUMN bill_name VARCHAR(255) NOT NULL;