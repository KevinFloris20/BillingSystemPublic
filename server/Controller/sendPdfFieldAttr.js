//this module will handle the sending of the field attributes to the client
const express = require('express');
const app = express();
const { getRowNum, getByColoumn } = require("../Model/getPDFFieldAttr.js"); //get the functions from the getfieldAttr.js file



app.get('/data', async (req, res) => {
    try{
        getRowNum().then((data) =>{
            res.send(data.toString())
        })
    }
    catch(err){
        console.log(err);
    }
});


module.exports = app;
