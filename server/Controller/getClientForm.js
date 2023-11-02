//this module controller will get the data from the client side when "submit" is selected
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

//parser for the post request
app.use(bodyParser.json());

//this will wait for the post request from the client side
var dataObj = {};

//require the validation module
const validation = require('../Model/validation.js');

app.post('/form', (req, res) => {

    const postBody = req.body;
    dataObj = postBody;

    // This will send the info to the validation file
    const DBres = validation.validateClientForm(dataObj);
    res.send(DBres);
});

module.exports = {
    app: app,
    dataObj: dataObj
};