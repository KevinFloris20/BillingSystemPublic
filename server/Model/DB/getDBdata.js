/*
The point:
This file will be the central file for getting DB data

It will include functions such as 
-most recent bills submitted
-bills by paramater
-get clients

*most recent bills submitted
    This function will get the most recent bills submitted and return them in an array of objects of bills
    - first the func will have sql templates and Obj Templates for reference
    - then the function will edit the sql templates to prepare them for the query
    - then the function will execute the query
    - then the data returned will be in arrays of result objects
    - lastly we will loop through the result objects and set the data to the bill objects, which would be constructed from the template
    - return the clean array of bill objects

*bills by paramater
    This function will edit the sql templates to prepare them for any unique query then pass to the previous 
    function to get an array of bill objects
    - (working on ittt)

*get clients
    this function will just get the clients from the DB and return them in an array of client objects
    - this is just a select all query and return
*/





/*
set up DB connection
*/
require('dotenv').config({path: 'cred.env'});
const mysql = require('mysql2');
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
        console.log('Connected to database - getting data');
    }
});




/*
--these are the templates the main function inherits and uses as a reference to construct the format for the client:
*/
//template bill object
const TemplateBillObj = {//this is the bill object its just a template
    billID: null,
    billNumber: "",
    billDate: "",
    createdDate: "",
    billName: "",
    client: "",
    clientId: 0,
    clientAddress: "",
    jobItemsArr: [
        // {
        //     chasisId:"",
        //     workItems:[
        //         // {workDescription:"",workPrice:""}
        //     ],
        //     totalJobCost:0,
        //     jobNumber:null
        // }
    ],
    totalBillCost: null
}

//template job object
const TemplateJobObj = {
    jobId:null,
    chasisId:"",
    workItems:[
        // {workId:null,workDescription:"",workPrice:""}
    ],
    totalJobCost:0,
    jobNumber:null
}

//template work item object
const TemplateWorkItemObj = {
    workId:null,
    workDescription:"",
    workPrice:""
}




/*
--these are the sql queries that will be used to get the data from the DB:
*/
const SQLmostRecentBills = `
    SELECT b.*, c.client_name, c.address 
    FROM bills b LEFT JOIN clients c ON b.client_id = c.client_id 
    ORDER BY b.bill_id 
    DESC LIMIT 10;
    `;

const SQLjobsPerBill = `SELECT * FROM jobs WHERE bill_id IN (?) ORDER BY job_id ASC`; 

const SQLworkItemsPerJob = `SELECT * FROM work_items WHERE job_id IN (?) ORDER BY work_id ASC`;




/*
--this is the main function for this file
*/
async function getRecentBills(){


    /*
        //
        **This section will get the data from the DB
        //
    */

    //get the most recent bills
    const listOfBills = await new Promise((resolve, reject) => {
        connection.query(SQLmostRecentBills, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });

    //get associated jobs for each bill
    const listOfJobs = await new Promise((resolve, reject) => {

        //this adds missing part of the query (list of bill ids)
        var sql = SQLjobsPerBill;
        var billIdArr = (listOfBills.map(bill => bill.bill_id)).join(", ");
        sql = sql.replace("(?)", "(" + billIdArr + ")");

        //this executes the query
        connection.query(sql,(err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });

    //get associated work items for each job
    const listOfWorkItems = await new Promise((resolve, reject) => {

        //this adds missing part of the query (list of job ids)
        var sql = SQLworkItemsPerJob;
        var jobIdArr = (listOfJobs.map(job => job.job_id)).join(", ");
        sql = sql.replace("(?)", "(" + jobIdArr + ")");

        //this executes the query
        connection.query(sql,(err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });

    console.log(listOfJobs,listOfWorkItems)




    /*    
        //
        **This section features a loop that will loop through each bill and set the values into a format the client will understand
        //
    */

    //declare the array of bills that will be eventually returned from this function
    var billsArr = [];

    //The l00p that will popluate the array of bills
    for(i = 0; i < listOfBills.length; i++){

        //set the billObj to the template
        var billObj = JSON.parse(JSON.stringify(TemplateBillObj))

        /*
        These next few lines are in this format:
        (set data to client obj) = (data from DB)
        */

        //set the bill id
        billObj.billID = listOfBills[i].bill_id;

        //set the bill number
        billObj.billNumber = listOfBills[i].bill_number;

        //set the bill date but in MM/DD/YYYY format
        var billDate = new Date(listOfBills[i].workDate);
        billObj.billDate = billDate.toLocaleDateString();

        //set the created date but in MM/DD/YYYY format
        var createdDate = new Date(listOfBills[i].date);
        billObj.createdDate = createdDate.toLocaleDateString();

        //set the bill name
        billObj.billName = listOfBills[i].client_id + (billObj.billDate.split("/")[2]).slice(2,4) + "-" + billObj.billNumber + "-" + billObj.billID;

        //set the client name
        billObj.client = listOfBills[i].client_name;

        //set the client id
        billObj.clientId = listOfBills[i].client_id;

        //set the client address
        billObj.clientAddress = listOfBills[i].address;

        //set the job items array && calc the total bill cost
        for(var j = 0; j < listOfJobs.length; j++){
            if(listOfJobs[j].bill_id == listOfBills[i].bill_id){
                var jobObj = JSON.parse(JSON.stringify(TemplateJobObj));

                //set the job id
                jobObj.jobId = listOfJobs[j].job_id;

                //set the chasis id
                jobObj.chasisId = listOfJobs[j].chasis_number;

                //set the job number
                jobObj.jobNumber = billObj.jobItemsArr.length+1;

                //set the work items array && calculate the total job cost
                for(var k = 0; k < listOfWorkItems.length; k++){
                    if(listOfWorkItems[k].job_id == listOfJobs[j].job_id){
                        var workItemObj = JSON.parse(JSON.stringify(TemplateWorkItemObj));

                        //set the work id
                        workItemObj.workId = listOfWorkItems[k].work_id;

                        //set the work description
                        workItemObj.workDescription = listOfWorkItems[k].des;

                        //set the work price
                        workItemObj.workPrice = Number(listOfWorkItems[k].price);

                        //calc and add to the total job cost
                        jobObj.totalJobCost += workItemObj.workPrice;

                        //add the work item to the job
                        jobObj.workItems.push(workItemObj);
                    }
                }

                //calc the total bill cost
                billObj.totalBillCost += jobObj.totalJobCost;

                //add the job to the job items array
                billObj.jobItemsArr.push(jobObj);
            }
        }

        //add the bill to the bills array
        billsArr.push(billObj);
    }




    /*
        //
        **RETURN THE BILLSARR (as a promise)
        //
    */
    console.log(billsArr[1]);
    return billsArr;
}






module.exports = {
    getRecentBills
}



