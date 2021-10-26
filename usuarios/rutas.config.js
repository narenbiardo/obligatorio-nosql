var express = require('express');
var app = express();

app.post('/usuarios', [
  CUsuarios.insert
]);