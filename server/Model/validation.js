// this will validate and return info regarding client form

//rn this dont work

//so ill just push everything to the db

//require the db module
const db = require('./DB/sendDBdata.js');

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim() !== '';
}

function isPositiveNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0;
}

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

    //Validate clientAddress as a nonempty string
    if (!isNonEmptyString(billObj.clientAddress)) {
        throw new Error('Client address must be a non-empty string.');
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

async function validateClientForm(dataObj) {
    const finaldataObj = await dataObj;
    if(finaldataObj == null){
        console.log("dataObj isnt ready");
        return;
    }
    try{
        const validatedBillObj = validateBillObject(finaldataObj);
        db.getCompletedBill(validatedBillObj).then((res) => {
            console.log(res, "hi");
        });
    }catch(e){
        console.log("dataObj has error");
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



//outline from the interweb
/*
Data Sanitization: Clean the input to ensure that no malicious SQL is injected into the database. This could involve escaping special characters, stripping out unwanted scripts, and using prepared statements in your SQL queries.

Data Type Checking: Confirm that each property of dataObj is of the expected type (e.g., strings for names and addresses, numbers for IDs and totals).

Data Format Validation: If there are specific formats for data like phone numbers, dates, or emails, use regular expressions or existing validation libraries to check them.

Required Fields: Ensure that all required fields are present and not empty.

Range and Size Checks: If there are expected ranges or sizes for the data (e.g., a total bill cost should be a positive number), then check for these as well.

Consistency Checks: If certain data depends on other data (e.g., a clientId must correspond to an existing client in the database), then these checks should be implemented.

Error Handling: If validation fails, the function should return a meaningful error message or code indicating what went wrong.

Testing: Implement unit tests to check various edge cases and ensure the validation logic is sound.

Code Comments: Update the code comments to reflect the validation process and remove any comments that suggest bypassing validation.
*/