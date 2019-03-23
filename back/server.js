const express = require('express');
const app = express();

require('dotenv').config();

app.listen(process.env.SERVER_BACK, () => {
    console.log("Server listening on port " + process.env.SERVER_BACK);
})