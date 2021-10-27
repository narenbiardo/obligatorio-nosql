var r = require('rethinkdb');
var express = require('express');
var app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());

var p = r.connect({ host: 'localhost', port: 28015, db: 'test'});

// Obtener codigos de error
app.get("/errores", (req, res) => {
  var errores = [
    'Error 101: al ingresar un nuevo usuario, ya existe un usuario con el correo ingresado',
    'Error 102: al eliminar un usuario o eliminar roles de un usuario, no existe un usuario con el correo ingresado',
    'Error 103: al agregar o eliminar uno o más roles de un usuario, al menos uno de los roles ingresados no existen para ese usuario',
    'Error 104: al agregar o al autenticar a un usuario, la contraseña ingresada es errónea'
  ]
  res.json(errores)
});


// Listar usuario
app.get("/usuarios", (req, res) => {
  p.then(function(conn) {
    r.table('usuarios')
      .run(conn, function (err, cursor) {
        if (err) throw err;
        cursor.toArray(function(err, res2){
          if (err) throw err;
          res.json(res2)
        });
    })
  }).error(function(err) {
    throw err;
  });
});

// Agregar usuario
app.post("/usuarios", (req, res) => {
  p.then(function(conn) {
    r.table('usuarios')
      .insert({
        correo: req.body.correo,
        pass: req.body.pass,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        roles: []
    })
      .run(conn, function (err, res2) {
        if (err) throw err;
        res.json(res2);
    })
  }).error(function(err) {
    throw err;
  });
});

// Detalle usuario
app.get('/usuarios:id', (req, res) => {
  p.then(function(conn) {
    r.table('usuarios')
      .get(req.body.correo)
      .run(conn, function (err, res2) {
        if (err) throw err;
        res.json(res2);
    })
  }).error(function(err) {
    throw err;
  });
});

// Eliminar usuario
app.delete('/usuarios:id', (req, res) => {
  p.then(function(conn) {
    r.table('usuarios')
      .get(req.body.correo)
      .delete()
      .run(conn, function (err, res2) {
        if (err) throw err;
        res.json(res2);
    })
  }).error(function(err) {
    throw err;
  });
});

// Agregar roles
app.post('/roles', (req, res) => {
  p.then(function(conn) {
    r.table('usuarios')
      .get(req.body.correo)
      .update({
        roles: r.row('roles').default([]).setUnion(req.body.roles)})
      .run(conn, function (err, res2) {
        if (err) throw err;
        res.json(res2);
    })
  }).error(function(err) {
    throw err;
  })
});

// Eliminar roles
//

// Autenticar usuario
//

app.listen(3000, () => {
  console.log("Escuchando en puerto 3000");
});