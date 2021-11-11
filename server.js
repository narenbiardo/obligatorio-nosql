var r = require('rethinkdb');
var express = require('express');
var funciones = require('./src/funciones.js');
const { response } = require('express');
const bdOperations = require('./src/bdOperations.js');
const operaciones = require('./src/operaciones.js');
var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var p = r.connect({ host: 'localhost', port: 28015, db: 'test' });

// Obtener codigos de error
app.get("/errores", (req, res) => {
  operaciones.codigosDeError(res);
});

// Agregar usuario
app.post("/usuarios", (req, res) => {
  operaciones.agregarUsuario(req.body.correo, req.body.pass, req.body.nombre, req.body.apellido, res);
});

// Agregar roles
app.post('/roles:usuarioId', (req, res) => {
  bdOperations.checkUserMail(req.body.correo, req.body.pass, req.body.roles, res, "agregarRoles");
});

// Eliminar roles
app.delete('/roles:usuarioId', (req, res) => {
  bdOperations.checkUserMail(req.body.correo, req.body.pass, req.body.roles, res, "eliminarRoles");
});

// Autenticar usuario
app.post('/autenticacion', (req, res) => {
  operaciones.autenticarUsuario(req.body.correo, req.body.pass, res);
});

app.listen(3000, () => {
  console.log("Escuchando en puerto 3000");
});