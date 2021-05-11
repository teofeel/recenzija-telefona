const express = require('express');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    comment:{
        type:String,
        required:true
    },
    grade:{
        type: Number, 
        required:true
    },
    likes:{
        type: Number
    },
    dislikes:{
        type: Number
    }
});


module.exports = CommentSchema;