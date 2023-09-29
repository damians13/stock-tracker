/* Create the tables */

CREATE TABLE IF NOT EXISTS account (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	email TEXT NOT NULL UNIQUE,
	password_hash CHAR(60) NOT NULL,
	password_salt CHAR(29) NOT NULL
);

CREATE TABLE IF NOT EXISTS portfolio (
	id SERIAL NOT NULL,
	name TEXT NOT NULL,
	PRIMARY KEY (id, name),
	FOREIGN KEY (id) REFERENCES account
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