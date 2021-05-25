const bodyParser = require('body-parser')
const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Phone = require('./models/phones');
const Comment = require('./models/comments');
const MongoClient = require('mongodb').MongoClient;

const uri = 'mongodb+srv://teofeel:test123@cluster0.wzhme.mongodb.net/phones-base?retryWrites=true&w=majority';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result)=>app.listen(8080, function(){console.log("Server is running");console.log('DB is working');}))
    .catch((err)=>console.log(err));


const app = express();
app.use(bodyParser.urlencoded({extended : true})); //za uzimanje podataka sa html
app.use(bodyParser.json());
app.set("view engine", "ejs"); //ejs templati

app.get('/',(req,res)=>{
    Phone.find({}, function(err, phones) {
        var id = new Array();
        for(i in phones){
            let idd = {id: phones[i]._id, name: phones[i].name};
            id.push(idd);
        }
        res.render('index', { ids:id }); //ucitavamo sve telefone z baze 
    });
});

app.get(`/:id/phone`, (req,res)=>{
    const {id} = req.params;

    Phone.findById(id, (err, phone)=>{
        var specs_d = phone.specs.displej;
        var specs_p = phone.specs.platforma;
        var specs_m = phone.specs.memorija;
        var specs_k = phone.specs.kamera;
        var specs_b = phone.specs.baterija;
        
        let br=0;

        let commentss = phone.comments;
        //let averagee = commentss.reduce((total,next)=> total + next.grade, 0)/commentss.length;

        /*for(i in commentss){
            if(commentss[i].grade == undefined){
                continue;
            }
            br+=commentss[i].grade;
        }*/

        let averagee=(commentss.reduce((total,next)=>total+next.grade, 0)/commentss.length).toFixed(2);

        res.render('phone',{phoneID:id, name: phone.name, paragraph: phone.review, cena: phone.price, specs_display: specs_d, specs_plat:specs_p, specs_mem:specs_m, specs_cam:specs_k, specs_battery:specs_b, comments:commentss, average:averagee, video: phone.video}); //upisivanje podataka u phone.ejs template
    })
    //.then((result)=>console.log(result))
    .catch((err)=>console.log(err));
});

app.get('/go-back', (req,res)=>{
    res.redirect('/');
});

app.post('/like/:comID/:phoneID', async (req,res)=>{
    var comID = req.params.comID; 
    var phoneID = req.params.phoneID;

    Phone.findOneAndUpdate({"_id": phoneID, "comments._id": comID},{$inc: {"comments.$.likes": 1}}, (err,result)=>{}); //povecava broj lajkova za 1

    res.redirect(`/${phoneID}/phone`);
});

app.post('/dislike/:comID/:phoneID', async (req,res)=>{
    var comID = req.params.comID;
    var phoneID = req.params.phoneID;
    
    Phone.findOneAndUpdate({"_id": phoneID, "comments._id": comID},{$inc: {"comments.$.dislikes": 1}}, (err,result)=>{}); //povecava broj dislajkova za 1

    res.redirect(`/${phoneID}/phone`);
});

app.post('/new-comment/:phoneID', async (req,res)=>{
    var phoneID = req.params.phoneID;

    var name1 = req.body.name;
    var comment1 = req.body.comment;
    var grade1 = req.body.star;

    var Comment = {name: name1, comment: comment1, grade: grade1, likes:0, dislikes:0, replies:[]};
    Phone.findOneAndUpdate(
        { _id: phoneID }, 
        { $push: { comments: Comment } },
        function (error, success) {
              if (error) {
                  console.log(error);
              } else {
                  console.log(success);
              }
        }); //dodaje novi komentar u telefon, pronadje broj id telefona u bazi i u njegove komentare doda komentar
    

        res.redirect(`/${phoneID}/phone`); //vrati na stranicu telefona
});

app.post('/reply/:comID/:phoneID', (req,res)=>{
    var comID = req.params.comID;
    var phoneID = req.params.phoneID;

    var name1 = req.body.replyName;
    var comment1 = req.body.replyComment;

    var Reply = {name: name1, comment: comment1};

    Phone.findOneAndUpdate(
        {"_id": phoneID, "comments._id": comID},
        {$push: {"comments.$.replies": Reply}}, 
        (err,result)=>console.log(err));

    res.redirect(`/${phoneID}/phone`);    
});


app.get('/admin/:password', (req,res)=>{
    const {password} = req.params
    if(password!='test123'){
        res.redirect('/');
    }
    res.render('admin'); //admin stranica, sluzi za dodavanje novih telefona, pristup samo ako se sifra unese u url
});

app.post('/new-phone',(req,res)=>{
    var name1 = req.body.name;
    var review1 = req.body.review;
    var video1 = req.body.video;
    var cena1 = req.body.cena;
    var d = req.body.displej;
    var p = req.body.platforma;
    var m = req.body.memorija;
    var k = req.body.kamera;
    var b = req.body.baterija;

    var displej1 = d.split('\n');
    var platforma1 = p.split('\n');
    var memorija1 = m.split('\n');
    var kamera1 = k.split('\n');
    var baterija1 = b.split('\n');

    var Telefon = new Phone({
        name: name1, 
        review: review1, 
        video: video1,
        price: cena1,
        specs:{
            displej: displej1,
            platforma: platforma1,
            memorija: memorija1,
            kamera: kamera1,
            baterija: baterija1
        },
        comments:[]
    });

    Telefon.save(); //dodaje novi telefon u bazu

    res.redirect('/'); 
});

