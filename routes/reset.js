const router=require('express').Router();
const express = require('express');
const db=require('../connection')

const app = express();
var sess;
router.route('/').post( (req, res) =>{
    //app.post("/reset", (req, res) =>{
    var username = req.body.username;
    console.log("username- "+username);
    var password = req.body.password;
    console.log("pass- "+password);
      const sqlReset = `UPDATE users SET password = "${password}" WHERE username = "${username}";`;
      console.log(sqlReset);
      db.query(sqlReset, (err, result) => {
          console.log("Password is reset"+result);
          var go = { goto: '/' };
            console.log("go"+go);
            return res.json(go); 
      });
  });
  
  module.exports=router