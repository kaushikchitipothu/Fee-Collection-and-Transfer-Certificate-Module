const express = require('express');
const router=express.Router();
const db=require('../connection')
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var xhr = new XMLHttpRequest();

router.route('/mobile').post( function(req, res,next)  {
    
    const username = req.body.username;
    const sqlMobile = "select mobile from users WHERE username = ?";
    console.log(sqlMobile);
      db.query(sqlMobile,
        [username],
        (err, result) => {
          console.log("in mobile"+result);
          const mobile=result[0].mobile;
          res.cookie("mob",mobile, {httpOnly: true});
          res.redirect("./otp");
      });
    });
  
    router.route('/otp').get( function(req, res,next)  {
  
      console.log("entered otp");
      var mobile = req.cookies["mob"];
      //res.clearCookie("mob", { httpOnly: true });
      console.log("mobile"+mobile);
      var data = null;
      var otp = Math.floor((Math.random()*1000000)+1);
      const sqlOTP = `UPDATE users SET code = ${otp} WHERE mobile = ${mobile};`;
      db.query(sqlOTP, (err, result) => {
          console.log("update"+result);
      });
  
      console.log(otp);
  
      // var xhr = new XMLHttpRequest();
      // xhr.withCredentials = true;
      // xhr.addEventListener("readystatechange", function () {
      // if (this.readyState === this.DONE) {
      //     console.log(this.responseText);
      // }
      // });
      // xhr.open("GET", `http://2factor.in/API/V1/6e1bc75f-a418-11eb-80ea-0200cd936042/SMS/${mobile}/${otp}`);
      // xhr.setRequestHeader("content-type", "application/x-www-form-urlencoded");
      // xhr.send(data);
  });
  
  //sms - check otp
  router.route('/check').post( function(req, res,next)  {
    
    const username = req.body.username;
    const code = req.body.code;
    const sqlCheck = "select code from users WHERE username = ?";
    console.log(sqlCheck);
    //const mobile="";
      db.query(sqlCheck,
        [username],
        (err, result) => {
          console.log("in mobile"+result[0].code);
          const DBcode=result[0].code;
          if(DBcode==code){
            var go = { username: username };
            console.log("go"+go);
            return res.json(go);  
          }
          else{
            res.send({message:"OTP not matching"});
          }
      });
    });

module.exports=router