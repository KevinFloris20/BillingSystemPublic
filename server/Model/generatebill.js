//get the pdf-lib and fs modules
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');



//tHIS FUNCTION WILL READ THE PDF TEMPLATE, GET ITS FIELDS, ORDER THE FIELDS,
//THEN POPULATE THE FIELDS WITH THE DATA GIVEN TO IT BECAUSE IT WILL GENERATE A BILL
//billArr is an array of objects for each workItem in the bill. each work item will include chasis num
//another array of work done and the number of times it was called on the chasis, price, and bill number,  
async function generate(billArr) {
    //open pdf doc, its bytes and the form, but first use a try/catch to see if the file exists
    let docBytes;
    try {
        docBytes = fs.readFileSync('FCRInvoiceTemplate.pdf');
    } catch (e) {
        if (e.code === 'ENOENT') {
            console.log('Original File not found!, Trying Public File...');
            try{
                docBytes = fs.readFileSync('InvoiceTemplate2.pdf');
            }
            catch(e){
                console.log('Public File not found!');
            }
        }
    }
    const doc = await PDFDocument.load(docBytes);
    const form = doc.getForm();

    //get the fields
    const fields = form.getFields();

    //create an array of the field names
    let fieldNames = [];
    fields.forEach(field => {
        fieldNames.push(field.getName());
    });

    //Edit the text field
    let textField = form.getTextField('1a');
    textField.setText(billArr);

    //save and print the new pdf
    const newPdfBytes = await doc.save();
    fs.writeFileSync('newPDF.pdf', newPdfBytes);
}



//export the function
module.exports = {
    generate
};

