const express = require('express');
const app = express();
const path = require('path');
const Rx = require('rxjs');


app.get('/', function (req, res) {
  //res.send('Hello World!')
  res.sendFile(path.join(__dirname +  "/public/index.html"));
});

app.use("/css", express.static(path.join(__dirname, 'public', 'css')));
app.use("/scripts", express.static(path.join(__dirname, 'public', 'scripts')));




app.listen(3000, function () {
  console.log('Tower Defense app listening on port 3000!')
});