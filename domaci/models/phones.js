const express = require('express');
const mongoose = require('mongoose');
const CommentSchema = require('./comments');
const Schema = mongoose.Schema;
const SpecSchema = require('./specs');

const PhoneSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    review:{
        type:String,
        required:true
    },
    video:{
        type:String,
        required: false
    },
    specs:{
        type: SpecSchema, //subdocument 
        required: true
    },
    comments:[
        {
            type: CommentSchema, //subdocument
            required: false
        }
    ]
});


const Phone = mongoose.model('phones', PhoneSchema);
module.exports = Phone;