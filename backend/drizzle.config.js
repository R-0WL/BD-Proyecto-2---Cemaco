const { defineConfig } = require('drizzle-kit');

module.exports = defineConfig({
  schema: './src/db/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: `postgresql://${process.env.DB_USER || 'proy3'}:${process.env.DB_PASSWORD || 'secret'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'tienda'}`,
  },
});
