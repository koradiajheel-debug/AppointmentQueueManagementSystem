process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.JWT_ACCESS_SECRET = 'test_jwt_access_secret_min_32_characters_long_for_security';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_min_32_characters_long_for_security';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/queuesmart_test';
process.env.DIRECT_URL = 'postgresql://test:test@localhost:5432/queuesmart_test';
process.env.CUSTOMER_URL = 'http://localhost:3000';
process.env.ADMIN_URL = 'http://localhost:3001';
