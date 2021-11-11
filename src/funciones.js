const bcrypt = require('bcrypt');
var r = require('rethinkdb');
var express = require('express');
var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var p = r.connect({ host: 'localhost', port: 28015, db: 'test' });


module.exports = {
  passToHash: async function (password) {
    const salt = bcrypt.genSaltSync(15);
    return password = await bcrypt.hash(password, salt);
  },
  compareHashedpass: async function (password, hashedPass) {
    return result = bcrypt.compareSync(password, hashedPass);
  }
}