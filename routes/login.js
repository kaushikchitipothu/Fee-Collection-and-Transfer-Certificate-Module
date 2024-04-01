const router=require('express').Router();
const { signedCookies } = require('cookie-parser');
const express = require('express');
const db=require('../connection')
const jwt = require('jsonwebtoken')
    
const app = express();

router.route('/').post( (req, res) =>{
   
  const username = req.body.username;
  const password = req.body.password;
  
  db.query(
    "SELECT * FROM admin WHERE uname = ? and pwd = ?",
    [username,password],
    (err, result) => {
      console.log(result);
      if (err) {
        res.send({ err: err });
      }  
      if (result.length > 0) {
        
        console.log(result[0]);   
        const user = result[0].uname;
        const token = jwt.sign({user}, 'shhhhh');
        console.log("token"+token);
        res.json({auth: true, token: token, result: result})                       
      } else {
          res.send({ auth: false, message: "Invalid details!" });
      }
  });   
});

// router.route('/user').post( (req, res) =>{
   
//     const username = req.body.username;
//     const password = req.body.password;
    
//     db.query(
//       "SELECT * FROM users WHERE username = ? and password = ?",
//       [username,password],
//       (err, result) => {
//         console.log(result);
//         if (err) {
//           res.send({ err: err });
//         }
    
//         if (result.length > 0) {
//           console.log(result[0]);   
//           const user = result[0].uname;
//           const token = jwt.sign({user}, 'shhhhh');
//           console.log("token"+token);
//           res.json({auth: true, token: token, result: result})                       
//         } else {
//             res.send({ auth: false, message: "Invalid details!" });
//         }
//     });      
//   });

  router.route('/logout').get( (req, res) =>{
   /* console.log("hey hey hey");
    //console.log(sess.user);
    //.log("in logout - "+req.signedCookies.id ) ;
   // res.clearCookie("sess", { httpOnly: true });
   if(sess){
     delete sess.user;
   
   sess=null;
   console.log("logged out"+sess);
   // req.session.destroy(function(err) {
      
     // res.clearCookie('code')
      var re = { goto: "/out" };
      console.log("logout-"+re);
      return res.json(re);
   /* if (req.session.user) {
        console.log(req.session.user);
      res.send({ loggedIn: false});
    } else {
        console.log("hi");
      res.send({ loggedIn: true });
    }*/   

});

  //exports.names=names
  module.exports = router

  