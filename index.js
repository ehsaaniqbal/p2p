const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const PORT = 8000 || process.env.PORT;

app.get('/', (req, res )=>{
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.use('/resources', express.static('./source'));

app.listen(PORT, ()=>{
    console.log(`Server started at ${PORT}`)
})