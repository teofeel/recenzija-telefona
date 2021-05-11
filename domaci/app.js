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
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.set("view engine", "ejs");

app.get('/add-phone', (req,res)=>{
    const phone = new Phone({
        name: "Iphone 11 Pro Max",
        review: "Tekst neki",
        specs:{
            displej: ["Super Retina XDR OLED, HDR10", "6.5 inches, 102.9 cm2 (~83.7% screen-to-body ratio)", "1242 x 2688 pixels, 19.5:9 ratio", "Scratch-resistant glass, oleophobic coating"],
            platforma: ["iOS 13, upgradable to iOS 14","Chipset - Apple A13 Bionic (7 nm+)","CPU -Hexa-core (2x2.65 GHz Lightning + 4x1.8 GHz Thunder)","GPU- Apple GPU (4-core graphics)"],
            memorija: ["Interna memorija - 64GB/4GB RAM, 256GB/4GB RAM, 512GB/4GB RAM"],
            kamera: ["Zadnja kamera - 12 MP, f/1.8, 26mm (wide)","12 MP, f/2.0, 52mm (telephoto)","12 MP, f/2.4, 13mm (ultrawide)","Prednja kamera - 12 MP, f/2.2, 23mm (wide)","Video - 4K@24/30/60fps, 1080p@30/60/120/240fps, HDR"],
            baterija: ["Li-Ion 3969 mAh","Fast charging 18W, 50% u 30 min"]
        },
        comments:[
            {name:"Neki Lik", comment:"Dobar fon", grade: 5, likes:10, dislikes:4}
        ]
    });

    phone.save();
    res.redirect('/');
});

app.get('/',(req,res)=>{
    Phone.find({}, function(err, phones) {
        var id = new Array();
        for(i in phones){
            let idd = {id: phones[i]._id, name: phones[i].name};
            id.push(idd);
        }
        res.render('index', { ids:id });
    });
});

app.get(`/phone/:id`, (req,res)=>{
    const {id} = req.params;

    Phone.findById(id, (err, phone)=>{
        var specs_d = phone.specs.displej;
        var specs_p = phone.specs.platforma;
        var specs_m = phone.specs.memorija;
        var specs_k = phone.specs.kamera;
        var specs_b = phone.specs.baterija;
        let averagee = 0;
        let br=0;

        var commentss = new Array();
        for(c in phone.comments){
            var comment_name = phone.comments[c].name;
            var comment_c = phone.comments[c].comment;
            var comment_grade = phone.comments[c].grade;
            var comment_num_likes = phone.comments[c].likes;
            var comment_num_dislikes = phone.comments[c].dislikes;
            averagee+=comment_grade;
            br++;

            let comment = {id: phone.comments[c].id, name: comment_name, comment: comment_c, grade: comment_grade, likes: comment_num_likes, dislikes: comment_num_dislikes};
            commentss.push(comment);
        }
        averagee/=br;
        res.render('phone',{phoneID:id, name: phone.name, paragraph: phone.review, specs_display: specs_d, specs_plat:specs_p, specs_mem:specs_m, specs_cam:specs_k, specs_battery:specs_b, comments:commentss, average:averagee});
    });
});

app.post('/like/:phoneID/:comID',  (req,res)=>{
    var comID = req.params.comID;
    var phoneID = req.params.phoneID;

    Phone.findOneAndUpdate({"_id": phoneID, "comments._id": comID},{$inc: {"comments.$.likes": 1}}, (err,result)=>{});

    res.redirect(`/phone/${phoneID}`);
});

app.post('/dislike/:phoneID/:comID',  (req,res)=>{
    var comID = req.params.comID;
    var phoneID = req.params.phoneID;
    
    Phone.findOneAndUpdate({"_id": phoneID, "comments._id": comID},{$inc: {"comments.$.dislikes": 1}}, (err,result)=>{});

    res.redirect(`/phone/${phoneID}`);
});

app.post('/new-comment/:phoneID', (req,res)=>{
    var phoneID = req.params.phoneID;

    var name1 = req.body.name;
    var comment1 = req.body.comment;
    var grade1 = req.body.star;

    var Comment = {name: name1, comment: comment1, grade: grade1, likes:0, dislikes:0};
    Phone.findOneAndUpdate(
        { _id: phoneID }, 
        { $push: { comments: Comment } },
        function (error, success) {
              if (error) {
                  console.log(error);
              } else {
                  console.log(success);
              }
        });
    

    res.redirect(`/phone/${phoneID}`);
});

app.get('/admin/:password', (req,res)=>{
    const {password} = req.params
    if(password!='test123'){
        res.redirect('/');
    }
    res.render('admin');
});

app.post('/new-phone',(req,res)=>{
    var name1 = req.body.name;
    var review1 = req.body.review;
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
        specs:{
            displej: displej1,
            platforma: platforma1,
            memorija: memorija1,
            kamera: kamera1,
            baterija: baterija1
        },
        comments:[]
    });

    Telefon.save();

    res.redirect('/');
});

