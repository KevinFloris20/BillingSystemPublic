// Initiate server
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const main = require('./Controller/main.js');

app.use(main)

// Start server
app.listen(port, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(`Server is running on port ${port}`);
    }
});