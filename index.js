const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require("cookie-parser");

const connection=require('./connection')
const jwt = require('jsonwebtoken')

require('dotenv').config();
app.use(express.json());
app.use(
    cors({
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    })
  );

app.use(cookieParser('subscribe'));
const login=require("./routes/login")
const mail = require("./routes/mail");
const sms = require("./routes/sms");
const reset = require("./routes/reset");
app.use("/mail",mail);
app.use("/sms",sms);
app.use("/reset",reset);
app.use("/admin",login);


//user
app.post('/auth/user', (req, res) =>{
   
    const username = req.body.username;
    const password = req.body.password;
    connection.query(
      "SELECT * FROM users WHERE username = ? and password = ?",
      [username,password],
      (err, result) => {
        console.log(result);
        if (err) {
          res.send({ err: err });
        }
    
        if (result.length > 0) {   
          const user = result[0].username;
          const token = jwt.sign({user}, 'shhhhh');
          console.log("token"+token);
          res.json({auth: true, token: token, result: result})  
		  //res.redirect("/book/check");                     
        } else {
            res.send({ auth: false, message: "Invalid details!" });
        }
    });      
  });

app.get('/feeStatus/:id',(request,res)=>{
	
	var d=request.params.id
	var m;
	connection.query("SELECT feeStatus FROM fee WHERE  username = ?",
	[d],
	(err, result) => {
		if (result.length > 0) {
			result.map((r)=>{
				m=String(r.feeStatus)
			})
		}
		res.json(JSON.stringify(m))
		res.end()
	  }
	)   
})

app.get('/feeDetails/:id',(request,response)=>{
	var m=[]
	var d=request.params.id
	console.log(d,'1')
	connection.query(
		"select firstname,lastname,s.year as year,scholarship,feeStatus,chalanNo,paymentMode from users s inner join fee f on f.username=s.username where s.username=?",
		[d],
		(err, result) => {
		  if (result.length > 0) {
			  console.log(result)
			result.map((r)=>{
				m.push(r)
			})
		}
		return response.json(JSON.stringify(m))
	})
 })



 app.get('/feePayment/:id',function(request,response){
    var name=request.params.id
    var s,y,f;
    var a=[];
    connection.query(
        "SELECT scholarship,year from fee where username= ?",[name],
        (err, result) => {
            if (result.length > 0) {
                result.map((r)=>{
                    s=String(r.scholarship);
                    y=String(r.year);
                })
                connection.query(
                    "SELECT fees from feeStructure where year= ?",[y],
                    (err, result) => {
                        if (result.length > 0) {
                            result.map((z)=>{
                                f=String(z.fees)
                                a.push(s)
                                a.push(f)
                                response.json(JSON.stringify(a))
                            })
                        }
                        else
                        {
                            response.send("P")
                        }
                    })
            }
        })
})

app.post('/feePayment',function(request,response){
    var name=request.body.username
    var q=""
    var t=""
    connection.query(
        "SELECT year from fee where username= ?",[name],
        (err, result) => {
          if (result.length > 0) {
            result.map((r)=>{
                t=t+r.year
                if(t=="1")
                {
                    q="UPDATE fee set first='Y', feeStatus='Paid', paymentMode='Online', paidOn=curdate() where username = ?"
                }
                if(t=="2")
                {
                    q="UPDATE fee set second='Y', feeStatus='Paid', paymentMode='Online', paidOn=curdate() where username = ?"
                }
                if(t=="3")
                {
                    q="UPDATE fee set third='Y', feeStatus='Paid', paymentMode='Online', paidOn=curdate() where username = ?"
                }
                if(t=="4")
                {
                    q="UPDATE fee set fourth='Y', feeStatus='Paid', paymentMode='Online', paidOn=curdate() where username = ?"
                }
            })
            connection.query(
                q,[name],
                (err, result) => {
                  if (err) {
                    response.send(err)
                    response.end()
                  }
                  else{
                    console.log('Yes')
                    response.send('success')
                  }
            })
        }
        else{
            response.send(err)
            response.end()
        }
    })
})

app.get('/tcStatus/:id',(request,res)=>{
	
	var d=request.params.id
	var m;
	connection.query("SELECT status FROM allappointment WHERE  username = ? and status='TC Collected'",
	[d],
	(err, result) => {
		console.log("inside tc query")
		if(result.length>0){
		//if (result[0].status==="TC Collected") {
			result.map((r)=>{
				m=String(r.status)
			})
		//}
	}
		res.json(JSON.stringify(m))
		res.end()
	  }
	)	
})

app.get('/book/check/:id',(request,response)=>{
	var d=request.params.id
	
	console.log('inside check'+d)
	connection.query(
		"SELECT * FROM appointment WHERE  username = ?",[d],
		(err, result) => {
			if (result.length > 0) {
				response.send('Cannot make an appointment')
		   }
		  else
		  {
			response.send('ok')
		  }
		 
		})		
})

app.get('/book/:id',(req, res) => 
{
    var m=[]
	const date=new Date(req.params.id)
	console.log(date)
	const d=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
	m.push(d)
	console.log(d)
	connection.query(
		"SELECT * FROM appointment WHERE  appointDate = ?",
		[d],
		(err, result) => {
		  if (result.length > 0) {
			result.map((r)=>{
				m.push(String(r.appointTime))
			})
		}
		res.json(JSON.stringify(m))
		res.end()
	})
})

app.post('/timeSlot', function(request, response) {
	var time=request.body.timing
	var d=new Date(request.body.date)
	
	const da=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
	console.log('timeslot'+da)
	var user=request.body.username
	var date=new Date()
	var t=(new Date()).getTime()
	var today=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()
	console.log(da+''+today+''+user)
	connection.query(
		"SELECT * FROM appointment WHERE appointDate = ? and appointTime=?",
		[da,time],(err, result) => {
				 if(result.length>0)
				 {
					return response.send('OOPS!! slot has been booked already')
				 }
				 else
				 {
					connection.query(
						"INSERT INTO appointment(username,bookedOn,appointDate,appointTime,status,timestamp) VALUES (?,?,?,?,?,?)",
						[user,today,da,time,"Booked",t],
							(err,result) => {
							if(err)
							{
								response.send(err)
								response.end()
							}
					})
					connection.query(
						"INSERT INTO allAppointment(username,bookedOn,appointDate,appointTime,status,timestamp) VALUES (?,?,?,?,?,?)",
						[user,today,da,time,"Booked",t],
							(err,result) => {
								console.log('inside query')
							if(err)
							{
								response.send(err)
								response.end()
							}	
					})
					response.send('sucess')
				 }
		})
})

// app.post('/book',function(request, response) {
//     var date = new Date(request.body.date);
	
// 	response.send(d)
// 	response.end()
//   });

app.get('/viewAll/:id',function(request,response){
	var m=[]
	var d=request.params.id
	console.log(d)
	connection.query(
		"SELECT * FROM allAppointment WHERE  username = ?",
		[d],
		(err, result) => {
		  if (result.length > 0) {
			result.map((r)=>{
				m.push(r)
			})
		}
		return response.json(JSON.stringify(m))

	})
})

//view in cancel page
app.get('/view/:id',function(request,response){
	
	var m=[]
	var d=request.params.id
	connection.query(
		"SELECT * FROM appointment WHERE  username = ?",
		[d],
		(err, result) => {
		  if (result.length > 0) {
			  console.log(result)
			result.map((r)=>{
				m.push(String(r.bookedOn))
				m.push(String(r.appointDate))
				m.push(String(r.appointTime))
				m.push(String(r.status))
				m.push(String(r.timestamp))
			})
		}
		response.json(JSON.stringify(m))
		response.end()
	})
})

app.post('/cancel',(request,response)=>{
		
	var d=request.body.username
	var date=request.body.date
	console.log(date)
	console.log('in cancel')
	connection.query(
		"DELETE FROM appointment WHERE  username = ?",[d],
		(err,result)=>{
			 if(err)
			 {
				 response.send(err)
				 response.end()
			 }	 
		})
		connection.query(
			"UPDATE allAppointment SET status='Cancelled by user' WHERE  username = ? and  timestamp=?",
			[d,date],
			(err,result)=>{
				 if(err)
				 {
					 response.send(err)
					 response.end()
				 }
				 else
				 {
					 response.send('deleted')
				 }	 
			})
})

app.get('/userProfile/:id',function(request,res){
	var d=request.params.id
	var m=[]
	console.log('inside profile')
 connection.query(
	 "SELECT * FROM users WHERE  username = ?",[d],
	 (err, result) => {
		 if (result.length > 0) {
		   result.map((r)=>{
			   m.push(String(r.username))
			   m.push(String(r.email))
			   m.push(String(r.mobile))
			   m.push(String(r.firstname))
			   m.push(String(r.lastname))
			   m.push(String(r.year))
			   m.push(String(r.class))
		   })
	   }
	   res.json(JSON.stringify(m))
	   console.log(m)
	   res.end()
	 })
})



app.get('/view/check/:id',(request,response)=>
{
	var d=request.params.id
	connection.query(
		"SELECT * FROM allAppointment WHERE  username = ?",[d],
		(err,result)=>{
             if(result.length>0)
			 {
				console.log('ok')
				response.send('ok')
			 }
			 else
			 {
				response.send('No appointments available')
				response.end()
			 }
		})
})

//admin

app.get('/adminViewFeeDetails',function(request,res)
{
	var m=[]
	connection.query(
		"select s.username as username,firstname,lastname,s.year as year,scholarship,feeStatus,chalanNo,paymentMode from users s inner join fee f where f.username=s.username",
		(err, result) => {
			if (result.length > 0) {
				console.log(result)
			  result.map((r)=>{
				  m.push(r)
				 console.log(r);
			  })
		}
		res.json(JSON.stringify(m))
		console.log(m)
		res.end()
	}
	)
})

app.post('/verify',function(request,response){

    var name=request.body.rno;
    var s,y,f,t;
    var a=[];
    connection.query(
        "SELECT scholarship,year,feeStatus from fee where username= ?",[name],
        (err, result) => {
            if (result.length > 0) {
                result.map((r)=>{
                    s=String(r.scholarship);
                    y=String(r.year);
                    t=String(r.feeStatus)
                })
				if(t==='Paid')
				{
		        	response.send('Paid')
					response.end()
				}
				else
				{
                connection.query(
                    "SELECT fees from feeStructure where year= ?",[y],
                    (err, result) => {
                        if (result.length > 0) {
                            result.map((z)=>{
                                f=String(z.fees)
                                a.push(s)
                                a.push(f)
								a.push("Success")
								
                               
                                response.json(JSON.stringify(a))
                            })
                        }
                    })
				}
            }
	
            else{
                a.push(s)
                a.push(f)
                a.push("Fail")
                response.json(JSON.stringify(a))
            }
        })
})

app.post('/feeUpdate',function(request,response){
    var name=request.body.rno;
    var cno=request.body.cno;
    var q=""
    var t=""
    connection.query(
        "SELECT year from fee where username= ?",[name],
        (err, result) => {
          if (result.length > 0) {
            result.map((r)=>{
                t=t+r.year
                if(t=="1")
                {
                    q="UPDATE fee set first='Y', feeStatus='Paid', paymentMode='Offline', paidOn=curdate(), chalanNo=? where username = ?"
                }
                if(t=="2")
                {
                    q="UPDATE fee set second='Y', feeStatus='Paid', paymentMode='Offline', paidOn=curdate(), chalanNo=? where username = ?"
                }
                if(t=="3")
                {
                    q="UPDATE fee set third='Y', feeStatus='Paid', paymentMode='Offline', paidOn=curdate(), chalanNo=? where username = ?"
                }
                if(t=="4")
                {
                    q="UPDATE fee set fourth='Y', feeStatus='Paid', paymentMode='Offline', paidOn=curdate(), chalanNo=? where username = ?"
                }
            })
            connection.query(
                q,[cno,name],
                (err, result) => {
                  if (err) {
                    response.send(err)
                    response.end()
                  }
                  else{
                        console.log('Yes')
                        response.send('success')
                  }
            })
        }
        else{
            response.send(err)
            response.end()
        }
    })
})

app.get('/viewAdminAll',function(request,res){
	var m=[]
connection.query(
	"SELECT s.username,firstname,lastname,year,bookedOn,appointDate,appointTime,status,timestamp FROM users s inner join allAppointment a where a.username=s.username",
	(err, result) => {
		if (result.length > 0) {
			console.log(result)
		  result.map((r)=>{
			  m.push(r)
		  })
	}
	res.json(JSON.stringify(m))
	res.end()
	})
})

app.post('/adminCancel',(request,response)=>{
	
	var user=request.body.username
	const date=request.body.date
	console.log(date)
	console.log('in admin cancel')
	connection.query(
		"DELETE FROM appointment where username=?",
		[user],
		(err,result)=>{
			 if(err)
			 {
				 response.send(err)
				 response.end()
			 }	 
		})
		connection.query(
			"UPDATE allAppointment SET status='Cancelled by admin' WHERE  username = ? and timestamp=?",
			[user,date],
			(err,result)=>{
				 if(err)
				 {
					 response.send(err)
					 response.end()
				 }
				 else
				 {
					 response.send('deleted')
				 }	 
			})

})
app.post('/adminUpdate',(request,response)=>{
	
	var user=request.body.username
	var date=request.body.date
	var status=request.body.status
	console.log(user)
	console.log('in adminUpdateStatus cancel')
	connection.query(
		"DELETE FROM appointment where username=? ",
		[user],
		(err,result)=>{
			 if(err)
			 {
				 response.send(err)
				 response.end()
			 }	 
		})
		connection.query(
			"UPDATE allAppointment SET status=? WHERE  username = ? and timestamp=?",
			[status,user,date],
			(err,result)=>{
				 if(err)
				 {
					 response.send(err)
					 response.end()
				 }
				 else
				 {
					 response.send('updated')
				 }	 
			})

})
		
// app.get('/book/checkAll',(request,response)=>{
// 	connection.query(
// 		"SELECT * FROM appointment",
// 		(err,result)=>{
//              if(result.length>0)
// 			 {
// 				 response.send('ok')
// 			 }
// 			 else
// 			 {
// 				response.send('cannot change status')
// 			 }
// 		})
// })

// app.get('/view/checkAll',(request,response)=>
// {
	
// 	connection.query(
// 		"SELECT * FROM allAppointment",
// 		(err,result)=>{
//              if(result.length>0)
// 			 {
// 				response.send('ok')
// 			 }
// 			 else
// 			 {
// 				response.send('No appointments available')
// 				response.end()
// 			 }
// 		})

// })	
	
app.listen(3002, () => {
    console.log("running on port 3002")
})