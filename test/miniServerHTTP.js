const express = require('express');
const port = 8081;

express().use(express.static(__dirname)).listen(port);
console.log("Listening on port", port);
