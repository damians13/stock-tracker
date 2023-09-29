/* Create the tables */

CREATE TABLE IF NOT EXISTS account (
	id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	name TEXT NOT NULL,
	email TEXT NOT NULL UNIQUE,
	password_hash CHAR(60) NOT NULL,
	password_salt CHAR(29) NOT NULL
);

CREATE TABLE IF NOT EXISTS portfolio (
	account_id INTEGER,
	name TEXT NOT NULL,
	PRIMARY KEY (account_id, name),
	FOREIGN KEY (account_id) REFERENCES account ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auth_session (
	id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	account_id INTEGER,
	created_date DATE,
	created_time TIME,
	is_active BOOLEAN,
	FOREIGN KEY (account_id) REFERENCES account ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stock (
	id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	ticker TEXT NOT NULL,
	exchange TEXT NOT NULL,
	company_name TEXT
);

CREATE TABLE IF NOT EXISTS historical_stock_price (
	stock_id INTEGER,
	created_date DATE,
	created_time TIME,
	open_price INTEGER,
	close_price INTEGER,
	high_price INTEGER,
	low_price INTEGER,
	volume_traded INTEGER,
	PRIMARY KEY (stock_id, created_date, created_time),
	FOREIGN KEY (stock_id) REFERENCES stock ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transaction (
	id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY
	/* TODO */
);

CREATE TABLE IF NOT EXISTS held_share (
	id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	fraction DECIMAL NOT NULL CHECK (fraction > 0 AND fraction <= 1),
	purchase_transaction_id INTEGER NOT NULL,
	sale_transaction_id INTEGER,
	FOREIGN KEY (purchase_transaction_id) REFERENCES transaction ON DELETE CASCADE,
	FOREIGN KEY (sale_transaction_id) REFERENCES transaction ON DELETE CASCADE
);

/* Insert test data */
INSERT INTO account (
	name,
	email,
	password_hash,
	password_salt
) VALUES (
	'test',
	'test@gmail.com',
	'$2b$10$V8DMEZF6gh3t/9F9OSL8luBNkXVFfT8YMo/MF02f2neiU4g2F0WTC',
	'$2b$10$V8DMEZF6gh3t/9F9OSL8lu'
);