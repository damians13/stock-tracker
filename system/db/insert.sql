/* Create an account for the system (for logging) */
INSERT INTO account (
	id,
	client_name,
	email,
	password_hash,
	password_salt
) OVERRIDING SYSTEM VALUE VALUES (
	0,
	'system',
	'system@gmail.com',
	'$2b$10$V8DMEZF6gh3t/9F9OSL8luBNkXVFfT8YMo/MF02f2neiU4g2F0WTC',
	'$2b$10$V8DMEZF6gh3t/9F9OSL8lu'
) ON CONFLICT DO NOTHING;

/* Insert test data */