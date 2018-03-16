const config = {
 dbHost: '127.0.0.1',
 dbUser : 'root',
 dbName: 'SURICATS_DB',
 dbPassword: 'root',
 dbPort : 3306,
 port : 8080,
  // dbHost: process.env.DB_HOST,
  // dbUser : process.env.DB_USER,
  // dbName: process.env.DB_NAME,
  // dbPassword: process.env.DB_PASSWORD,
  // dbPort : process.env.DB_PORT,
  // port : process.env.API_PORT,
  fileUploadPath : '/tmp/uploads/',
  maxFileSize: 10000 // in bytes
};
module.exports = config;
