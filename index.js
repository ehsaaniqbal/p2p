const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();


app.get('/', (req, res )=>{
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.use('/resources', express.static('./source'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Server running on ${PORT}`)
});