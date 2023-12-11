/* Create the tables */

CREATE TABLE IF NOT EXISTS account (
	id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	client_name TEXT NOT NULL,
	email TEXT NOT NULL UNIQUE,
	password_hash CHAR(60) NOT NULL,
	password_salt CHAR(29) NOT NULL
);

CREATE TABLE IF NOT EXISTS portfolio (
	account_id INTEGER,
	portfolio_name TEXT NOT NULL,
	PRIMARY KEY (account_id, portfolio_name),
	FOREIGN KEY (account_id) REFERENCES account ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auth_session (
	id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	account_id INTEGER NOT NULL,
	created_date DATE,
	created_time TIME,
	created_by_system BOOLEAN DEFAULT false,
	ip_address INET,
	mac_address MACADDR,
	is_active BOOLEAN NOT NULL,
	FOREIGN KEY (account_id) REFERENCES account ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS stock (
	ticker TEXT PRIMARY KEY,
	exchange TEXT NOT NULL,
	company_name TEXT,
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

CREATE TABLE IF NOT EXISTS stock_transaction (
	id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	account_id INTEGER NOT NULL,
	portfolio_name TEXT NOT NULL,
	FOREIGN KEY (account_id, portfolio_name) REFERENCES portfolio (account_id, portfolio_name) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS purchase (
	id INTEGER PRIMARY KEY,
	FOREIGN KEY (id) REFERENCES stock_transaction ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sale (
	id INTEGER PRIMARY KEY,
	percent_commission DECIMAL,
	flat_commision DECIMAL,
	FOREIGN KEY (id) REFERENCES stock_transaction ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS held_share (
	id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	fraction DECIMAL NOT NULL CHECK (fraction > 0 AND fraction <= 1),
	purchase_id INTEGER NOT NULL,
	sale_id INTEGER,
	FOREIGN KEY (purchase_id) REFERENCES purchase ON DELETE CASCADE,
	FOREIGN KEY (sale_id) REFERENCES sale ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS log_event (
	id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	auth_session_id INTEGER NOT NULL,
	created_date DATE NOT NULL,
	created_time TIME NOT NULL,
	log_message TEXT,
	FOREIGN KEY (auth_session_id) REFERENCES auth_session ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account_log_event (
	id INTEGER PRIMARY KEY,
	account_id INTEGER NOT NULL,
	log_type TEXT NOT NULL,
	FOREIGN KEY (id) REFERENCES log_event ON DELETE CASCADE,
	FOREIGN KEY (account_id) REFERENCES account ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS portfolio_log_event (
	id INTEGER PRIMARY KEY,
	account_id INTEGER NOT NULL,
	portfolio_name TEXT NOT NULL,
	log_type TEXT NOT NULL,
	FOREIGN KEY (id) REFERENCES log_event ON DELETE CASCADE,
	FOREIGN KEY (account_id, portfolio_name) REFERENCES portfolio (account_id, portfolio_name) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS generic_log_event (
	id INTEGER PRIMARY KEY,
	FOREIGN KEY (id) REFERENCES log_event ON DELETE CASCADE
);
