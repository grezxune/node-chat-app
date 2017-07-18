const port = process.env.PORT || 3000;
const path = require('path');
const express = require('express');

const publicPath = path.join(__dirname, '../public');

var app = express();

app.use(express.static(publicPath));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
console.log(__dirname + '/../public');
console.log(publicPath);
