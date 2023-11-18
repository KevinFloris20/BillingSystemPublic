/*
this file was HARRRDDDDDD heres the hella documentation for it :3

This file's purpose is to return a fully populated bill object based on the provided client bill object.

The process involves:

Posting all necessary data to the database to retrieve the server IDs.
Updating the received incomplete bill object with this new data.
File Structure:

Establish the database connection.
Manage the client ID of the bill: verify if the client exists in the database. If not, add it; otherwise, return the existing ID.
Separate any notes from work items and add them as well.
Proceed to add the bill to the database and obtain the bill ID along with work IDs.
After completing these steps, update the bill object with the new bill name and IDs.
In the end, return the updated bill object.
*/
require('dotenv').config({path: 'cred.env'});
const mysql = require('mysql');


async function getCompletedBill(billObjIn){

    var billObj = await billObjIn;

    //-----------------------------------------------------------------------------------------------------
    // add the client id to bill
    //-----------------------------------------------------------------------------------------------------


    /*
    set up DB connection
    */
    const host = process.env.DB_HOST;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASS;
    const database = process.env.DB_NAME;
    const dbConfig = {
        host: host,
        user: user,
        password: password,
        database: database
    };
    const connection = mysql.createConnection(dbConfig);
    connection.connect((err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Connected to database - posting data');
        }
    });



    /*
    get ALL the client id from the database, return an array of objects
    */
    var clientArr = [];//This is for storing the current list of clients
    async function getClientIDs(){
        if(clientArr.length == 0){
            return new Promise((resolve, reject) => {
                connection.query('SELECT * FROM clients', (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                        clientArr = res;
                        return res;
                    }
                });
            });
        }else{
            return clientArr;
        }

    }



    /*
    Register a new client into the DB
    it takes the client name and address and returns the client id
    as well as update the object with the new client id
    */
    async function postClientId(clientName,clientAddress){
        console.log("Posted data to DB.")
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO clients (client_name, address) VALUES (?,?)', [clientName, clientAddress], async (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                    const resID = await res.insertId;

                    //update the bill
                    billObj.clientId = resID;

                    return resID;
                }
            });
        });
    }



    /*
    get the client id or ids from the database if it exists
    Then pass the ids 
    */
    async function getClientId(clientName,clientIdArr){
        //set client id default to null. I will check if a value is assigned to this later
        var clientID = 0;
        var clientIdArr = await clientIdArr;

        //check client id arr for the client name
        clientIdArr.some(client => {
            if(client.client_name == clientName){
                clientID = client.client_id;
                return true;
            }
        });

        //if the client does not exist, add the client to the database --- if it does return id --- if fails clientid var will remain null and return an error
        if (clientID == 0){
            return postClientId(clientName,billObj.clientAddress)
        }
        else if(clientID != 0 && clientID != null){
            return clientID;
        }
        else if(clientID == null){
            return console.log("error getting client id");
        }
    }




    //-----------------------------------------------------------------------------------------------------
    // add the bill to the DB
    //-----------------------------------------------------------------------------------------------------


    /*
    This entire func will be adding the object into the DB
    */
    async function insertDBdata(input) {
        //these are the queries that will be used
        const billsSQL = 'INSERT INTO bills (bill_number, workDate, date, client_id) VALUES (?,?,?,?)';
        const jobsSQL = 'INSERT INTO jobs (bill_id, equipment_number) VALUES (?,?)';
        const workItemsSQL = 'INSERT INTO work_items (job_id, des, note, price) VALUES (?,?,?,?)';
        const notesSQL = 'INSERT INTO notes (work_id, note) VALUES (?,?)';

        //set the client id var from the updated bill object
        var clientID = billObj.clientId;
        if (typeof clientID != "number"){
            Promise.all([clientID]);
            clientID = clientID.insertId;
            billObj.clientId = clientID;
        }

        



        //add the bill to the database
        async function getBillId(clientid){
            //--
            //how this works is that the client id is passed to the function and then
            //we wait for it to resolve
            //once done we can use the resolved value in the query
            //once the query is done we can return the value and update the bill object
            //--


            //wait for clientid to be resolved if a promise is returned
            var resolvedClientID = await clientid;

            //get current date and put it in YYYY-MM-DD format for sql and add to bill object
            var today = new Date();
            var todaysdate = today.toISOString().slice(0, 10);
            billObj.createdDate = todaysdate;

            //put work date in sql format as well
            var workDate = input.billDate.split("/")[2] + "-" + input.billDate.split("/")[0] + "-" + input.billDate.split("/")[1];


            //send query to db

            const billIdRes = await new Promise((resolve,reject) => {
                connection.query(billsSQL, [input.billNumber, workDate, todaysdate, resolvedClientID],(err, res) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            });
            //set bill id once ready from db
            const resID = billIdRes.insertId;

            //update the bill
            billObj.billID = resID;

            //return id
            return resID;
        }



        //add the jobs to the database
        async function getJobId(billID){
            //--
            //how this works is that we will be passing jobs to the function
            //these job objects will be added to the DB and we will get the job id's
            //once the job id's are returned we can update the bill object and pass it along
            //--

            var resolvedBillID = await billID;

            // function runQuery(){
            var jobIdArr = [];

            const promises = input.jobItemsArr.map(async (job) => {
                //send query to db
                const resID = new Promise((resolve,reject)=>{
                    connection.query(jobsSQL, [resolvedBillID, job.equipmentId],(err, res) => {
                            if (err) {
                                console.log(err);
                                reject(err);
                            } else {
                                resolve(res);
                            }
                        }
                    )
                })

                //add to the results arr to be passed to next function
                var id = await resID;
                id = id.insertId;
                jobIdArr.push(id);

                //update the billObject with the id
                billObj.jobItemsArr.forEach(jobb => {
                    if(jobb.equipmentId == job.equipmentId){
                        jobb.jobID = id;
                    }
                });
            })

            await Promise.all(promises);
            return jobIdArr;
        };



        //add the work items to db, some finalization to the obj and return obj (if data has note add the note to the db)
        async function getworkItem(jobID){
            //--
            //how this works is that we will be passing an array of objects to the function
            //this array of obj will be added to the db so we can get the job id's
            //once the job id's are returned we can update the bill object
            //this is the last step in the process and we will then update the clientbill object
            //we will also be adding the name to the bill object
            //--

            //get an array of jobID's from the jobID var thats being passed multiple objects
            var jobIDArr = await jobID;

            var workItemsArr = [];
            function runQuery(){
                var incrementJob = 0;
                input.jobItemsArr.forEach(job => {
                    var incrementWork = 0;
                    job.workItems.forEach(async (workItem) => {
                        //parse the note from the work description
                        var note = null;
                        if(workItem.workDescription.includes("$")){
                            note = workItem.workDescription.split("$")[1];
                            workItem.workDescription = workItem.workDescription.split("$")[0];
                        }

                        //send query to db
                        const res = new Promise((resolve,reject)=>{
                            connection.query(workItemsSQL, [jobIDArr[incrementJob], workItem.workDescription, note, workItem.workPrice], async (err, res) => {
                                if (err) {
                                    console.log(err);
                                    reject(err);
                                } else {
                                    resolve(res);
                                }
                            });
                        })

                        //add to the results arr to be passed
                        var id = await res;
                        id = id.insertId;
                        workItemsArr.push(id);


                        //update the bill
                        billObj.jobItemsArr.forEach(jobb => {
                            if(jobb.jobID == jobIDArr[incrementJob]){
                                jobb.workItems.forEach(workItemm => {
                                    if(workItemm.workID == workItem.workID){
                                        workItemm.workID = id;
                                    }
                                });
                            }
                        });


                        //increment the work id
                        incrementWork++;
                    });
                    //increment the job id
                    incrementJob++;
                });
                return workItemsArr;
            }

            //wait for everything to end
            await Promise.all(runQuery());


            //close connection
            connection.end();


            //create the bill name (clientId + year + - + billID + - + billNumber)
            var year = billObj.billDate.split("/")[2];
            var clientID = billObj.clientId;
            if (typeof clientID != "number"){
                Promise.all([clientID]);
                clientID = clientID.insertId;
            }
            //get last two digits of year
            year = year.slice(2,4);
            //create the bill name
            billObj.billName = clientID + year + "-"  + billObj.billNumber + "-" + billObj.billID;


            //done
            return billObj;
        }



        //done
        return getworkItem(getJobId(getBillId(clientID)));
    };


    
    //run all the code
    return getClientId(billObj.client,getClientIDs()).then(async (res)=>{
        billObj.clientId = await res;
        return insertDBdata(billObj);
    });
}

// module.exports = { getCompletedBill };
module.exports = { getCompletedBill };

var billObj = {
    billID: 0,
    billNumber: "a",
    billDate: "09/16/2023",
    billName: "",
    client: "A",
    clientId: 0,
    clientAddress: "a",
    jobItemsArr:[
        {
            equipmentId:"a",
            workItems:
            [
                {workDescription:"a$aa",workPrice:"85"},
                {workDescription:"a$gi",workPrice:"85"}
            ],
            totalJobCost:170,
            jobNumber:1
        },
        {
            equipmentId:"a",
            workItems:
            [
                {workDescription:"a",workPrice:"85"},
                {workDescription:"a",workPrice:"85"}
            ],
            totalJobCost:170,
            jobNumber:2
        }
    ],
    totalBillCost: 340
}

var billObj1 = {
    billID: 0,
    billNumber: "b",
    billDate: "09/17/2023",
    billName: "",
    client: "b",
    clientId: 0,
    clientAddress: "b",
    jobItemsArr: [
        {
            equipmentId:"b",
            workItems:[
                {workDescription:"b$beeee",workPrice:"90"},
                {workDescription:"b",workPrice:"100"}
            ],
            totalJobCost:190,
            jobNumber:1
        },
        {
            equipmentId:"b",
            workItems:[
                {workDescription:"b",workPrice:"90"},
                {workDescription:"b",workPrice:"100"}
            ],
            totalJobCost:190,
            jobNumber:2
        }
    ],
    totalBillCost: 380
}

var billObj2 = {
    billID: 0,
    billNumber: "c",
    billDate: "09/18/2023",
    billName: "",
    client: "c",
    clientId: 0,
    clientAddress: "c",
    jobItemsArr: [
        {
            equipmentId:"c",
            workItems:[
                {workDescription:"c$ccc",workPrice:"95"},
                {workDescription:"c",workPrice:"105"}
            ],
            totalJobCost:200,
            jobNumber:1
        }
    ],
    totalBillCost: 200
}

var billObj3 = {
    billID: 0,
    billNumber: "d",
    billDate: "09/19/2023",
    billName: "",
    client: "d",
    clientId: 0,
    clientAddress: "d",
    jobItemsArr: [
        {
            equipmentId:"d",
            workItems:[
                {workDescription:"d",workPrice:"100"},
                {workDescription:"d",workPrice:"110"},
                {workDescription:"d",workPrice:"115"}
            ],
            totalJobCost:325,
            jobNumber:1
        }
    ],
    totalBillCost: 325
}



//this is the test code
// getCompletedBill(billObj).then((res)=>{
//     console.log(res);
// });
// getCompletedBill(billObj1).then((res)=>{
//     console.log(res);
// });
// getCompletedBill(billObj2).then((res)=>{
//     console.log(res);
// });
// getCompletedBill(billObj3).then((res)=>{
//     console.log(res);
// });


//for reference heh
/*
//import and run insertDBdataTEST.js file and pass obj

const insertDBdataTEST = require('./insertDBdataTEST.js');

var billObj = {
    billID: 0,
    billNumber: "09162023",
    billDate: "09/16/2023",
    billName: "0",
    client: "test client",
    clientId: 0,
    clientAddress: "100 test street 10314 test city",
    jobItemsArr: [{equipmentId:"AIMZ111222",workItems:[{workDescription:"This is the test Description$testNote",workPrice:"85"},{workDescription:"This is the test Description2",workPrice:"85"}],totalJobCost:170,jobNumber:1},{equipmentId:"AIMZ333222",workItems:[{workDescription:"This is the test Description",workPrice:"85"},{workDescription:"This is the test Description2",workPrice:"85"}],totalJobCost:170,jobNumber:2}],
    totalBillCost: 340
}

var billObj1 = {
    billID: 0,
    billNumber: "09172023",
    billDate: "09/17/2023",
    billName: "",
    client: "client A",
    clientId: 0,
    clientAddress: "101 A street 10315 city A",
    jobItemsArr: [
        {
            equipmentId:"AIMZ112233",
            workItems:[
                {workDescription:"Description A1",workPrice:"90"},
                {workDescription:"Description A2",workPrice:"100"}
            ],
            totalJobCost:190,
            jobNumber:1
        },
        {
            equipmentId:"AIMZ444555",
            workItems:[
                {workDescription:"Description A3",workPrice:"90"},
                {workDescription:"Description A4",workPrice:"100"}
            ],
            totalJobCost:190,
            jobNumber:2
        }
    ],
    totalBillCost: 380
}

var billObj2 = {
    billID: 0,
    billNumber: "09182023",
    billDate: "09/18/2023",
    billName: "",
    client: "client B",
    clientId: 0,
    clientAddress: "102 B street 10316 city B",
    jobItemsArr: [
        {
            equipmentId:"AIMZ556677",
            workItems:[
                {workDescription:"Description B1",workPrice:"95"},
                {workDescription:"Description B2",workPrice:"105"}
            ],
            totalJobCost:200,
            jobNumber:1
        }
    ],
    totalBillCost: 200
}

var billObj3 = {
    billID: 0,
    billNumber: "09192023",
    billDate: "09/19/2023",
    billName: "",
    client: "client C",
    clientId: ,
    clientAddress: "103 C street 10317 city C",
    jobItemsArr: [
        {
            equipmentId:"AIMZ788899",
            workItems:[
                {workDescription:"Description C1",workPrice:"100"},
                {workDescription:"Description C2",workPrice:"110"},
                {workDescription:"Description C3",workPrice:"115"}
            ],
            totalJobCost:325,
            jobNumber:1
        }
    ],
    totalBillCost: 325
}

insertDBdataTEST.getCompleteBill(billObj);
*/