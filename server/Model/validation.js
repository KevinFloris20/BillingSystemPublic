// this will validate and return info regarding client form

//rn this dont work

//so ill just push everything to the db

//require the db module
const db = require('./DB/sendDBdata.js');

async function validateClientForm(dataObj) {
    const finaldataObj = await dataObj;
    if(finaldataObj == null){
        console.log("dataObj isnt ready");
        return;
    }
    else{
        db.getCompletedBill(finaldataObj).then((res) => {
            console.log(res, "hi im from validation");
        });
    }
}

module.exports = {
    validateClientForm
};
