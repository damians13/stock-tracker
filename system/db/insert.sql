/* Insert test data */
INSERT INTO account (
	id,
	name,
	email,
	password_hash,
	password_salt
) VALUES (
	0,
	'system',
	'system@gmail.com',
	'$2b$10$V8DMEZF6gh3t/9F9OSL8luBNkXVFfT8YMo/MF02f2neiU4g2F0WTC',
	'$2b$10$V8DMEZF6gh3t/9F9OSL8lu'
) WHERE NOT EXISTS (
	SELECT * FROM account WHERE id = 0
);