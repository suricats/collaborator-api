const config = {
  dbHost: process.env.DB_HOST,
  dbUser : process.env.DB_USER,
  dbName: process.env.DB_NAME,
  dbPassword: process.env.DB_PASSWORD,
  dbPort : process.env.DB_PORT,
  port : process.env.PORT,
  authToken : process.env.SECRET_TOKEN,
  fileUploadPath : '/tmp/uploads/',
  maxFileSize: 10000 //in bytes
};
module.exports = config;
