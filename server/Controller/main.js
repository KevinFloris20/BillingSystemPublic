const express = require('express');
const path = require('path');
const router = express.Router();

// Set up static files
router.use(express.static('../client'));

//this will allow the client to switch to the search page
router.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

router.get('/recentBills', (req, res) => {
    //send the data returned from getDBdata.js to the client
    const printdata = require('../Model/DB/getDBdata.js');
    printdata.getRecentBills().then((data) => {
        res.send(data);
    });
});


//this will let the href tag in the client side html file to download the pdf
router.get('/downloadInvoice', (req, res) => {
    res.sendFile(path.join(__dirname, '../newPDF.pdf'));
}); 

//this will allow the client to switch to the search page
// router.get('/search', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client/search.html'));
// });


//this will generate the pdf
const generateBill = require('../Model/generatebill.js');
generateBill.generate('1');


//this will send the number of rows in the bill to the client
const senddata = require('./sendPdfFieldAttr.js');
router.use("/",senddata);


//this will get the data from the client side and post it to the server
const getdata = require('./getClientForm.js').app;
router.use("/",getdata);

// const printdata = require('./Model/DB/getDBdata.js')
// console.log(printdata.getRecentBills().then((res)=>{console.log("logged")}));
// var incompleteBill = {
//     billID: 0,
//     billNumber: "d",
//     billDate: "09/19/2023",
//     billName: "",
//     client: "d",
//     clientId: 0,
//     clientAddress: "d",
//     jobItemsArr: [
//         {
//             chasisId:"d",
//             workItems:[
//                 {workDescription:"d",workPrice:"100"},
//                 {workDescription:"d",workPrice:"110"},
//                 {workDescription:"d",workPrice:"115"}
//             ],
//             totalJobCost:325,
//             jobNumber:1
//         }
//     ],
//     totalBillCost: 325
// }
// const printdata = require('./Model/DB/sendDBdata.js')
// console.log(printdata.getCompletedBill(incompleteBill).then((res)=>{console.log(res,"logged")}));

module.exports = router;    