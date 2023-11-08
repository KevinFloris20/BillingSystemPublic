/*
Objective:::::
ok so i want to make a billing system that generates reports and saves bills to the server and eventually get and study that data.

Part 1:
Make all of the the billing system's front end functions entirely contained on the client side.

Such as generating or removing additional fields and forms,
adding event listeners,
making sure the user is aware of the limited bill space,
and getting and posting information from and to the server,
make typing as ergonomical as possible,
form validation
automattically fill in the total price of the bill
*/


//just regular counters for the amount of rows in the bill
let jobLines = 1;
let totalRowsInDom = 1;




//this function will return amount of total rows in the blank bill
//This is getting posted data from the server about the attributes of row number in the blank bill
async function getRows(){
    //handle the errors 
    try{
        //get from /data
        const response = await fetch('/data')

        //check if the response is ok
        if(!response.ok){
            throw new Error('Issue in the getRows functions response');
        }
        
        //this creates a promise and then once the promise is fulfilled it fills in the data into the object
        res = response.json()
        res.then((data) => {
            data--;//leave room in the bottom for the total
            document.getElementById('rowNumInBill').innerHTML = ("Total rows in bill: " + data);
            return data;//this returns data
        });
        return res

    }
    catch(err){
        console.log(err);
    }
}

let rowsInBill //saves the number of rows on the bill the server posts
getRows().then((numOfRows)=>{
    rowsInBill = numOfRows;
})

//calculate the amount of rows left based on the amount of lines made
function printLeftOverRows(){
    leftOverRows = rowsInBill - totalRowsInDom - 1;//leave room in the bottom of the bill for the total
    document.getElementById("rowLeftInBill").innerHTML = ("Total rows left: " + leftOverRows);
    return leftOverRows
}


//clean the form when done
var original = '';
function cleanForm(input){
    //reset the form
    document.getElementById("ClientBill").innerHTML = input;

    //set the curser to the first input field
    document.getElementById("billNumber").focus();
}


//This funtion will take in an event object or Objects and will manipulate the HTML according to the button's ID
//All the logic needed to keep the form consistant and be manipulated within a certain scope is in this function
// the func printleftoverrows is in every case bcs its to update the top of the page to show the user amount of rows left
function editHTML(e,x){
    switch(e.target.id){
        case 'addWorkItemBtn': //this button id case will add a new work item to each job (the works description and price form lines). It will add this before the button. and it will check if we have enough rows
            //update the dom
            totalRowsInDom++;
            var lor = printLeftOverRows()

            //if too many rows then end the program
            if(lor <= 0){
                return document.getElementById("rowLeftInBill").innerHTML = "Not enough row space for more rows";
            }

            //add the new line
            e.target.parentElement.insertAdjacentHTML('beforebegin', `
            <div class = "WorkItem" id = "WorkItemId">
                Work Item: <input type="text" name="WorkDesInput" class="WorkDescription" />
                Price: <input type="text" name="WorkPriceInput" class="WorkItemPrice" />
            </div>
            `);

            //this selects the new blank input field once its added (user doesnt need to reach to move mouse) It will add this before the button
            e.target.parentElement.previousElementSibling.querySelector("input").focus(); 

            return;


        case 'addJobItem': //this button id case will add a whole new job to the bill, and check if it has enough rows
            //update the dom
            totalRowsInDom++;
            var lor = printLeftOverRows()

            //if too many rows then end the program
            if(lor <= 0){
                return document.getElementById("rowLeftInBill").innerHTML = "Not enough row space for more rows";
            }

            //add the new line
            jobLines++;
            e.target.parentElement.insertAdjacentHTML('beforebegin', `
            <div class="jobLineDiv">
                <div class = "jobItemNum">Job Item `+jobLines+`:</div>
                <div id="workItemAndPriceLine" style = "display:inline-block">
                    <div style = "display:inline-block;vertical-align:top;">
                        Equipment Number: <input type="text" name="EquipmentIdInput" class="EquipmentId" />
                    </div>
                    <div style = "display:inline-block">
                        <div class = "WorkItem" id = "WorkItemId">
                            Work Item: <input type="text" name="WorkDesInput" class="WorkDescription" />
                            Price: <input type="text"name="WorkPriceInput"  class="WorkItemPrice" />
                         </div>
                        <div id = "WorkItemBtnDiv">
                            <button type = "button" style = "margin:10px;" id = "addWorkItemBtn">Add Work Item</button>
                        </div>
                    </div>
                </div>
            </div>
            `);

            //this selects the Equipment id form field once its added (again user doesnt need to move to reach mouse and only relys on keyboard)
            e.target.parentElement.previousElementSibling.querySelector(".EquipmentId").focus();

            return;
        
        case 'RemoveWorkItem':
            //this case will have the logic for removing work items
            //it also checks if there is one workItem left and then it will delete it and its parent element since there is
            //no need to make the user delete both job and work item if they delete the last job item
            //if there is more than one work item then it will just delete the work item
            if (x.target.parentElement.childElementCount <= 2){
                x.target.parentElement.parentElement.parentElement.remove();
                jobLines--;
            }
            else{
                x.target.remove();
            }

            //updating dom
            totalRowsInDom--;
            printLeftOverRows();
            return;
        
        case 'RemoveJobItem':
            //updating dom
            //print length of parent element
            
            totalRowsInDom = totalRowsInDom - (x.target.parentElement.children[1].children[1].children.length - 1);
            printLeftOverRows();

            //just removing the job item
            x.target.parentElement.remove();
            return;

            
    }
}




//once the dom is loaded add all the event listeners for the buttons 
window.addEventListener('DOMContentLoaded', () => {
    //this will be the original form html
    original = document.getElementById("ClientBill").innerHTML;
  


    //adds an event listener to the whole form (ClientBill)
    //then passes the clicked element to the editHTML function
    document.getElementById('ClientBill').addEventListener("click",(e) => {
        editHTML(e);
    });



    //These next few lines will add an event listen but also add a new context menu
    //This menu is if the user wants to remove a line added
    document.getElementById('ClientBill').addEventListener("contextmenu",(event) => {
        
        //check if the right clicked element is a work item
        if(event.target.id === "WorkItemId"){
            //kill the old context menu
            event.preventDefault();

            //give birth to new context menu
            let contextMenu = document.getElementById('contextMenu1');
            contextMenu.style.display = "block";
            contextMenu.style.left = event.pageX + "px";
            contextMenu.style.top = event.pageY + "px";

            //edit the html
            isLisItem = true
            document.getElementById('RemoveWorkItem').addEventListener("click",(childEvent) => {
                editHTML(childEvent,event)
            },{once:true});
        }
        else if(event.target.id === "jobItemNum"){
            //kill the old context menu
            event.preventDefault();

            //give birth to new context menu
            let contextMenu = document.getElementById('contextMenu2');
            contextMenu.style.display = "block";
            contextMenu.style.left = event.pageX + "px";
            contextMenu.style.top = event.pageY + "px";

            //edit the html
            isLisJob = true;
            document.getElementById('RemoveJobItem').addEventListener("click",(childEvent)=>{
                editHTML(childEvent,event)
            },
            {once:true});
        }

    });



    //makes the context menu disapear
    document.addEventListener("click",() => {
        document.getElementById('contextMenu1').style.display = "none";
        document.getElementById('contextMenu2').style.display = "none";
    })



    //this prevents default form behavior when clicking the enter key on the form input (which is enter the whole god damn form)
    //This only allows you to click enter on buttons NOT INPUT FIELDS
    document.getElementById('ClientBill').addEventListener("keydown",(e) => {
        if(e.key === "Enter" && (e.target.tagName != "BUTTON")){
            e.preventDefault();
        }
    });



    //listen for any text added to the price input field and recalculates the total price of the bill
    //add error if the user adds the wrong input type for price
    document.getElementById('ClientBill').addEventListener("input",(e) => {
        if(e.target.name == "WorkPriceInput"){
            var total = 0;
            var priceInputs = document.getElementsByClassName("WorkItemPrice");
            for (var i = 0; i < priceInputs.length; i++) {
                
                //check if input string is the right type of number
                if(/^-?\d+(\.\d+)?$|^$/.test(priceInputs[i].value)){

                    //clear error text
                    document.getElementById("errorText").innerHTML = "";

                    //add up the total
                    if ((priceInputs[i].value.length > 0)) {
                        total += parseFloat(priceInputs[i].value);
                    }
                }
                else{
                    document.getElementById("errorText").innerHTML = "Error: Price must be a number";
                }

            }
            total = total.toFixed(2).toString();
            document.getElementById("total").innerHTML = ("$ " + total);
        }
    });


    //this is the big boy code time
    //this will be posting to the server when the form is submitted
    //Now i dont have unqiue identifiers and im not going to be doing that for my input names
    //on click of the submit i will manually get all the data from the form and orginize it and then submit it
    //this will be a tiny bit complicated but i will try my best u got this kevin :3
    document.getElementById('submitBtnID').addEventListener("click",(e) => {
        //prevent default form behavior
        e.preventDefault();
        console.log("submitted");
        //get the divs that contain the job items and work items
        var jobItemDivs = document.getElementsByClassName("jobLineDiv");
        console.log(jobItemDivs);
        //get the inputs per div
        var jobItemInputs = [];
        for (var i = 0; i < jobItemDivs.length; i++) {
            //This is an object for the characteristics of the job item
            var jobItemObj = {
                equipmentId: jobItemDivs[i].children[1].children[0].children[0].value,
                workItems: [],
                totalJobCost: 0,
                jobNumber: i+1
            }

            //put work item objects into the work items arr and into the job item object from the job item div
            var workItemDivs = jobItemDivs[i].children[1].children[1].children;//this gets the div that has the work items
            console.log(workItemDivs);
            for (var x = 0; x < workItemDivs.length-1; x++) {
                var workItemObj = {
                    workDescription: workItemDivs[x].children[0].value,
                    workPrice: workItemDivs[x].children[1].value
                }
                jobItemObj.workItems.push(workItemObj);
                
            }

            //calculate the total cost of the job item and add it to the job item object
            for (var x = 0; x < jobItemObj.workItems.length; x++) {
                if (jobItemObj.workItems[x].workPrice.length != ""){
                    jobItemObj.totalJobCost += parseFloat(jobItemObj.workItems[x].workPrice);
                }
                
            }

            //add the job item object to the job item inputs array
            jobItemInputs.push(jobItemObj);
        }

        
        //turn the date into a string with dd/mm/yyy format
        var thebilldate = document.getElementById("billDate").value;
        thebilldate = thebilldate.split("-");
        thebilldate = thebilldate[1] + "/" + thebilldate[2] + "/" + thebilldate[0];

        //create the object that will be posted to the server
        //this is at attr of the bill and then it will add the job items to jt
        var billObj = {
            billID: 0,
            billNumber: document.getElementById("billNumber").value,
            billDate: thebilldate,
            client: document.getElementById("Client").value,
            clientAddress: document.getElementById("ClientAddress").value,
            jobItemsArr: jobItemInputs,
            totalBillCost: 0
        };

        //calculate the total cost of the bill
        for (var i = 0; i < billObj.jobItemsArr.length; i++) {
            billObj.totalBillCost += billObj.jobItemsArr[i].totalJobCost;
        }

        //create a unique id for the bill
        billObj.billID = billObj.billDate + billObj.client + 1;

        //print the object
        console.log(billObj);

        var billTest = {
            billID: 0,
            billNumber: "09162023",
            billDate: "09/16/2023",
            client: "test client",
            clientAddress: "100 test street 10314 test city",
            jobItemsArr: [{equipmentId:"AIMZ111222",workItems:[{workDescription:"This is the test Description",workPrice:"85"},{workDescription:"This is the test Description2",workPrice:"85"}],totalJobCost:170,jobNumber:1},{equipmentId:"AIMZ333222",workItems:[{workDescription:"This is the test Description",workPrice:"85"},{workDescription:"This is the test Description2",workPrice:"85"}],totalJobCost:170,jobNumber:2}],
            totalBillCost: 340
        }

        //snd the object to the server
        fetch('/form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(billObj)
            // body: JSON.stringify(billTest)//TESTING


        })
        .then((response) => {
            console.log(response);
            //if the response is ok then clear the form
            if (response.ok){
                cleanForm(original);
            }
        })
        .catch((err) => {
            console.log(err);
        });
    });
}); 

async function displayResults() {
    const searchResults = document.getElementById("searchResults");
    // Sample array of objects
    // const data = [
    //     {
    //         billID: 0,
    //         billNumber: "d",
    //         billDate: "09/19/2023",
    //         billName: "",
    //         client: "d",
    //         clientId: 0,
    //         clientAddress: "d",
    //         jobItemsArr: [
    //             {
    //                 equipmentId:"d",
    //                 workItems:[
    //                     {workDescription:"d",workPrice:"100"},
    //                     {workDescription:"d",workPrice:"110"},
    //                     {workDescription:"d",workPrice:"115"}
    //                 ],
    //                 totalJobCost:325,
    //                 jobNumber:1
    //             }
    //         ],
    //         totalBillCost: 325
    //     },
    //     {
    //         billID: 0,
    //         billNumber: "c",
    //         billDate: "09/18/2023",
    //         billName: "",
    //         client: "c",
    //         clientId: 0,
    //         clientAddress: "c",
    //         jobItemsArr: [
    //             {
    //                 equipmentId:"c",
    //                 workItems:[
    //                     {workDescription:"c$ccc",workPrice:"95"},
    //                     {workDescription:"c",workPrice:"105"}
    //                 ],
    //                 totalJobCost:200,
    //                 jobNumber:1
    //             }
    //         ],
    //         totalBillCost: 200
    //     }
    // ];
    searchResults.innerHTML = ""; // Clear any previous results
    var data = [];
    // Get data from server
    await fetch('/recentBills')
        .then(response => response.json())
        .then(res => {
            console.log(res);
            data = res;
        })
        .catch(err => {
            console.log(err);
        });
    

    //make title
    if (data.length > 0) {
        // Display titles
        const titleRow = document.createElement('div');
        titleRow.className = 'result-row title-row';

        Object.keys(data[0]).forEach(key => {
            const titleCell = document.createElement('div');
            titleCell.className = 'result-cell title-cell';
            titleCell.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Convert to title case
            titleRow.appendChild(titleCell);
        });

        searchResults.appendChild(titleRow);
    }

    //show data
    data.forEach(item => {
        const row = document.createElement('div');
        row.className = 'result-row';

        Object.values(item).forEach(value => {
            const cell = document.createElement('div');
            cell.className = 'result-cell';
            cell.textContent = value;
            row.appendChild(cell);
        });

        searchResults.appendChild(row);
    });
}

//this will be the function for the tabs
function openTab(evt, tab) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tab).style.display = "block";
    evt.currentTarget.className += " active";

    //if it is search tab send the data
    if(tab === "Search"){
        displayResults();
    }
}










