const express = require('express');
const path = require('path');
const jsforce = require('jsforce');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Define a route for AJAX data
app.get('/data', async (req, res) => {
    const conn = new jsforce.Connection();
    const userInfo = await conn.login('bhavan@developerfrom2017.com', 'Salesforce@1')
    console.log("User ID: " + userInfo.id);
    console.log("Org ID: " + userInfo.organizationId);
    const result = await conn.query('SELECT Id, Name,(SELECT Id,Name,Description__c,Image_URL__c,Product_Category__c FROM Services__r) FROM Product_Category__c');
    const subServQuery = await conn.query('select Id,Name,Service__r.Name,Image_URL__c, Last_Updated__c from Sub_Service__c');
    const brandsQuery = await conn.query('select Sub_Service__r.Name,Id,Name, Additional_Info__c, Coupon_Code__c, Description__c, Image_URL__c, Offer__c, Sub_Service__c, Website_URL__c,IsActive__c, End_Date__c from Brand__c WHERE IsActive__c = true');
    res.json(
        {
            categoryRecords: JSON.parse(JSON.stringify(result.records)),
            subServiceRecords: JSON.parse(JSON.stringify(subServQuery.records)),
            brandRecords: JSON.parse(JSON.stringify(brandsQuery.records)),
        }
    );
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
