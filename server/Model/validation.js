//require the db module
const db = require('./DB/sendDBdata.js');

//This file just valides the client form data and sends it to the Db
//

//checks if the value is a non empty string
function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim() !== '';
}

//checks if the value is a positive number
function isPositiveNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0;
}

//this actually does the validation
function validateBillObject(billObj) {
    //Validate billID and make sure it is 0
    if (billObj.billID !== 0) {
        throw new Error('A new Bill ID must be Zero.');
    }

    //Validate billNumber(assuming it should be a string)
    if (typeof billObj.billNumber !== 'string') {
        throw new Error('Bill number must be a string.');
    }

    //WE ARE USING REGEX FOR THIS MM/DD/YYYY FORMATE WOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
    if (!/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(billObj.billDate)) {
        throw new Error('Bill date must be in MM/DD/YYYY format.');
    }

    //Validate client as a nonempty string
    if (!isNonEmptyString(billObj.client)) {
        throw new Error('Client must be a non-empty string.');
    }

    //Validate clientAddress as a string
    if (typeof billObj.clientAddress !== 'string') {
        throw new Error('Client address must be a string.');
    }

    //Validate jobItemsArr as an array and each items structure
    if (!Array.isArray(billObj.jobItemsArr)) {
        throw new Error('Job items must be an array.');
    }
    
    billObj.jobItemsArr.forEach((jobItem, index) => {
        //validate equipmentId
        if (typeof jobItem.equipmentId !== 'string') {
            throw new Error(`Equipment ID for job item at index ${index} must be a string.`);
        }
        //validate workItems as an array and each work item's structure
        if (!Array.isArray(jobItem.workItems)) {
            throw new Error(`Work items for job item at index ${index} must be an array.`);
        }
        jobItem.workItems.forEach((work, workIndex) => {
            //Validate workDescription as a non-empty string
            if (!isNonEmptyString(work.workDescription)) {
                throw new Error(`Work description for work item at index ${workIndex} in job item at index ${index} must be a non-empty string.`);
            }
            //validate workPrice as a positiv number
            if (!isPositiveNumber(work.workPrice)) {
                throw new Error(`Work price for work item at index ${workIndex} in job item at index ${index} must be a positive number.`);
            }
        });
        //validate totalJobCost as a positive number
        if (!isPositiveNumber(jobItem.totalJobCost)) {
            throw new Error(`Total job cost for job item at index ${index} must be a positive number.`);
        }
        //validate jobNumber as anumber
        if (typeof jobItem.jobNumber !== 'number') {
            throw new Error(`Job number for job item at index ${index} must be a number.`);
        }
    });

    // validate totalBillCost as a positive number
    if (!isPositiveNumber(billObj.totalBillCost)) {
        throw new Error('Total bill cost must be a positive number.');
    }

    //If all validations pass, return true or the validated object
    return billObj;
}

//this will encapsulate the form data in a try catch block and then passes it to the validation func
async function validateClientForm(dataObj) {
    const finaldataObj = await dataObj;
    if(finaldataObj == null){
        console.log("dataObj isnt ready");
        return;
    }
    try{
        //if theres an err thrown then it will be caught and non of the code below will run
        const validatedBillObj = validateBillObject(finaldataObj);
        console.log("Validation passed");

        //send the validatedBillObj to the db
        db.getCompletedBill(validatedBillObj);
    }catch(e){
        console.log("Failed Validation client dataObj has an error");
        console.log(e.message);
        return;
    }
}

module.exports = {
    validateClientForm,
    validateBillObject,
    isNonEmptyString,
    isPositiveNumber
};
