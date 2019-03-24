const express = require('express');
const dotenv = require('dotenv');
const bodyparser = require('body-parser');
const app = express();

dotenv.config();

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

app.use("/api/scrapper", require('./router/scanRoute'));

app.listen(process.env.BACK, () => {
    console.log("Server listening on port " + process.env.BACK);
})