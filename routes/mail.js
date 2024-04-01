var express = require('express')
let router = express.Router()
const db=require('../connection')
const nodemailer=require('nodemailer');
const { response } = require('express');

router.route("/").get((req, res) => {
    //const deadline = req.body.deadline;
    db.query('select email from users', function(err, results, fields) {
        if(err) throw err;
        const emails = JSON.stringify(results);
        var i,e;
        for (i = 1; i < emails.length-1; i++) {
            e+=emails[i];
        }
        var a=e.split(",");
        var b=[],c=0;
        for (c = 0; c < a.length; c++) {
            b[c]=a[c].slice(9,a[c].length-1);
        }

        let smtpTransport = nodemailer.createTransport({
            service:'Gmail',
            port:465,
            auth:{
                user:'liveupdate19@gmail.com',
                pass:'updates19'
            }
        });
        let mailOptions={
            from:'liveupdate19@gmail.com',
            to: b.join(), //'liveupdate19@gmail.com,livead1919@gmail.com', 
            subject: 'KMIT-Academic Fee 2020-21',
            text:'Dear Student, please pay your academic fees before 25-07-2021'
            //+ req.body.deadline
        };
        smtpTransport.sendMail(mailOptions, (error, info) => {
            if(error){
                console.log(error);
            } else {
                console.log('Email sent' + info.response);
                res.send("success");
            }
        });
    });
});

module.exports=router
