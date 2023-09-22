/* Create the tables */

CREATE TABLE IF NOT EXISTS Account (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	email TEXT NOT NULL,
	password_hash CHAR(64) NOT NULL,
	password_salt CHAR(64) NOT NULL,
	password_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS Portfolio (
	id SERIAL NOT NULL,
	name TEXT NOT NULL,
	PRIMARY KEY (id, name),
	FOREIGN KEY (id) REFERENCES Account
);

/* Insert test data */
INSERT INTO Account (
	name,
	email,
	password_hash,
	password_salt,
	password_date
) VALUES (
	'test',
	'test@gmail.com',
	'9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
	'9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
	'2023-09-21'
);