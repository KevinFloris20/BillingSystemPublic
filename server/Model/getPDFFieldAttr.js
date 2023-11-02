//this file will get the number of total rows in the bill
//and send that number to the client so that the client side js can generate the correct number of rows
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');



//returns the field names in the pdf and returns them in arrays by coloumn
async function getByColoumn() {
    //get the pdf bytes
    const docBytes = fs.readFileSync('FCRInvoiceTemplate.pdf');
    const doc = await PDFDocument.load(docBytes);
    const form = doc.getForm();

    //get the fields
    const fields = form.getFields();

    //create an array of the field names by coloumn and then seperates the different fields by their name
    let fieldNamesA = [];
    let fieldNamesB = [];
    let fieldNamesC = [];
    let fieldNamesX = [];
    fields.forEach(field => {
        if(field.getName().includes("a") && field.getName().length != 1){
            fieldNamesA.push(field.getName());
        }
        else if(field.getName().includes("b") && field.getName().length != 1){
            fieldNamesB.push(field.getName());
        }
        else if(field.getName().includes("c") && field.getName().length != 1){
            fieldNamesC.push(field.getName());
        }
        else{
            fieldNamesX.push(field.getName());
        }   
    });

    return [fieldNamesA, fieldNamesB, fieldNamesC, fieldNamesX];
}



//returns the number of rows in the bill
async function getRowNum() {
    const data = await getByColoumn();
    return data[0].length
}
    


//export the functions
module.exports = {
    getRowNum,
    getByColoumn
};
