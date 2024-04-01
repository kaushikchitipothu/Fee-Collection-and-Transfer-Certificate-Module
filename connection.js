const mysql = require("mysql");
const db = mysql.createConnection({
    host: 'localhost',
    user:'root',
    password:'',
    database: 'myapp',
   });
   
   db.connect(function(err){
       if(err){
       console.log('DB error');
       throw err;
      // return false;
       }
   });

module.exports=db


