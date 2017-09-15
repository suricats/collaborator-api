const config = {
  dbHost: process.env.DB_HOST,
  dbUser : process.env.DB_USER,
  dbName: process.env.DB_NAME,
  dbPassword: process.env.DB_PASSWORD,
  dbPort : process.env.DB_PORT,
  port : process.env.API_PORT,
  fileUploadPath : '/tmp/uploads/',
  maxFileSize: 1000 // in bytes
};
module.exports = config;
