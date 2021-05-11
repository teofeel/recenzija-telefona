const express = require('express');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SpecSchema = new Schema({
    displej:[
        {
            type: String,
            required: true
        }
    ],
    platforma:[
        {
            type: String,
            required: true
        }
    ],
    memorija:[
        {
            type: String,
            required: true
        }
    ],
    kamera:[
        {
            type: String,
            required: true
        }
    ],
    baterija:[
        {
            type: String,
            required: true
        }
    ]
});

module.exports = SpecSchema;