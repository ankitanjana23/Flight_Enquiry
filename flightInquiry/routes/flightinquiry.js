var express=require('express')
var router=express.Router()
var pool=require('./pool')
var upload=require('./multer')
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
router.get('/flightinterface',function(req,res){
    var admin=JSON.parse(localStorage.getItem('ADMIN'))
    if(admin)
    res.render('flightinterface',{message:''})
    else
    res.render('adminlogin',{message:''})
})
router.get('/displayallflights',function(req,res){
    var admin=JSON.parse(localStorage.getItem('ADMIN'))
   if(!admin)
   res.render('adminlogin',{message:''})
   else
  {  pool.query("select F.*,(select C.cityname from cities C where C.cityid=F.sourcecity) as source,(select C.cityname from cities C where C.cityid=F.destinationcity) as destination from flightsdetails F" , function(error,result){
        if(error) {
            console.log(error)
        res.render('displayallflights',{'data':[],'message':'Server Error'})
        }
        else 
        {
            res.render('displayallflights',{'data':result,'message':'Successful'})
        }
    })   
  }
})

router.get('/searchbyid',function(req,res){
    pool.query("select F.*,(select C.cityname from cities C where C.cityid=F.sourcecity) as source,(select C.cityname from cities C where C.cityid=F.destinationcity) as destination from flightsdetails F where flightid=?",[req.query.fid],function(error,result){
        if(error) {
            console.log(error)
        res.render('flightbyid',{'data':[],'message':'Server Error'})
        }
        else 
        {
            res.render('flightbyid',{'data':result[0],'message':'Successful'})
        }
    })   
   
}) 
router.get('/searchbyidforimage',function(req,res){
    pool.query("select F.*,(select C.cityname from cities C where C.cityid=F.sourcecity) as source,(select C.cityname from cities C where C.cityid=F.destinationcity) as destination from flightsdetails F where flightid=?",[req.query.fid],function(error,result){
        if(error) {
            console.log(error)
        res.render('showimage',{'data':[],'message':'Server Error'})
        }
        else 
        {
            res.render('showimage',{'data':result[0],'message':'Successful'})
        }
    })   
   
}) 
router.post('/flightsubmit',upload.single('logo'),function(req,res){
    console.log("BODY",req.body)
    console.log("FILE",req.file)
    var days=(""+req.body.days).replaceAll("'",'"')
pool.query("insert into flightsdetails (flightname, types, totalseates, days, sourcecity, departuretime, destinationcity, arrivaltime, company, logo)values(?,?,?,?,?,?,?,?,?,?)",[req.body.flightname,req.body.flighttype,req.body.noofseats,days,req.body.sourcecity,req.body.departuretime,req.body.destinationcity,req.body.arrivaltime,req.body.company,req.file.originalname],function(error,result){


if(error) {
    console.log(error)
res.render('flightinterface',{'message':'Server Error'})
}
else 
{
    res.render('flightinterface',{'message':'Record Submitted successfully'})
}
})
})
router.get('/fetchallcities',function(req,res){
    pool.query("select * from cities",function(error,result){
if(error){
    res.status(500).json({result:[],message:'Server Error'})
}
else{
    res.status(200).json({result:result,message:'Successful'})
}
})
})
router.post('/flight_edit_delete',function(req,res){
     
  if(req.body.btn=="Edit")
  {
   
    var days=(""+req.body.days).replaceAll("'",'"')
pool.query("update flightsdetails set flightname=?, types=?, totalseates=? , days=?, sourcecity=?, departuretime=?, destinationcity=?, arrivaltime=?, company=? where flightid=?",[req.body.flightname,req.body.flighttype,req.body.noofseats,days,req.body.sourcecity,req.body.departuretime,req.body.destinationcity,req.body.arrivaltime,req.body.company,req.body.flightid],function(error,result){


if(error) {
    console.log(error)
    res.redirect('/flight/displayallflights')  
}
else 
{
    res.redirect('/flight/displayallflights')   
}
})
  }


else {
   
pool.query("delete from flightsdetails where flightid=?",[req.body.flightname,req.body.flighttype,req.body.noofseats,days,req.body.sourcecity,req.body.departuretime,req.body.destinationcity,req.body.arrivaltime,req.body.company,req.body.flightid],function(error,result){


if(error) {
    console.log(error)
res.redirect('/flight/displayallflights')
}
else 
{
    res.redirect('/flight/displayallflights')  
}
})
}
})
router.post('/editimage',upload.single('logo'),function(req,res){
    console.log("BODY",req.body)
    console.log("FILE",req.file)
pool.query("update flightsdetails set logo=? where flightid=?",[ req.file.originalname, req.body.flightid],function(error,result){


if(error) {
    console.log(error)
    res.redirect('/flight/displayallflights')  
}
else 
{
    res.redirect('/flight/displayallflights')  
}
})
})

module.exports = router;