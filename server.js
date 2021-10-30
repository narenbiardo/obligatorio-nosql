var r = require('rethinkdb');
var express = require('express');
var app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());

var p = r.connect({ host: 'localhost', port: 28015, db: 'test'});

// Obtener codigos de error
app.get("/errores", (req, res) => {
  p.then(function(conn) {
      r.table('errores')
        .orderBy('error')
      .run(conn, function (err, res2) {
        if (err) throw err;
        res.json(res2);
    })
  }).error(function(err) {
    throw err;
  });
});

// Agregar usuario
app.post("/usuarios", (req, res) => {
  p.then(function(conn) {
    r.branch(
      // if
      r.table('usuarios')
        .get(req.body.correo)
        .eq(null).not(),
          // then:
          r.table('errores')
            .get(101),
      // else:
      r.table('usuarios')
        .insert({
          correo: req.body.correo,
          pass: req.body.pass,
          nombre: req.body.nombre,
          apellido: req.body.apellido,
          roles: []
        }))
      .run(conn, function (err, res2) {
        if (err) throw err;
        res.json(res2);
    })
  }).error(function(err) {
    throw err;
  });
});

// Agregar roles
app.post('/roles:usuarioId', (req, res) => {
  p.then(function(conn) {
    r.branch(
      // if
      r.table('usuarios')
        .get(req.body.correo)
        .eq(null),
          // then:
          r.table('errores')
            .get(102),
      // else if
      r.table('usuarios')
        .get(req.body.correo)('pass')
        .eq(req.body.pass).not(),
          // then:
          r.table('errores')
            .get(104),
      // else:
      r.table('usuarios')
        .get(req.body.correo)
        .update({roles: r.row('roles').default([]).setUnion(req.body.roles)}))
      .run(conn, function (err, res2) {
        if (err) throw err;
        res.json(res2);
    })
  }).error(function(err) {
    throw err;
  })
});

// Eliminar roles
app.delete('/roles:usuarioId', (req, res) => {
  p.then(function(conn) {
    var countRolesReq = req.body.roles.length;
    r.branch(
      // if
      r.table('usuarios')
        .get(req.body.correo)
        .eq(null),
          // then:
          r.table('errores')
            .get(102),
      // else if
      r.table('usuarios')
        .get(req.body.correo)('pass')
        .eq(req.body.pass).not(),
          // then:
          r.table('errores')
            .get(104),
      // else if, roles que traigo del body request != roles del usuario
      r.table('usuarios')
        .get(req.body.correo)('roles')
        .setIntersection(req.body.roles)
        .count()
        .eq(countRolesReq).not(),
          // then
          r.table('errores')
            .get(103),
        // else:
        r.table('usuarios')
        .get(req.body.correo)
        .update({roles: r.row('roles').difference(req.body.roles)}))
      .run(conn, function (err, res2) {
        if (err) throw err;
        res.json(res2)
    })
  }).error(function(err) {
    throw err;
  })
});

// Autenticar usuario
app.post('/autenticacion', (req, res) => {
  p.then(function(conn) {
    r.branch(
      // if
      r.table('usuarios')
        .get(req.body.correo)
        .eq(null),
          // then:
          false,
      // else if
      r.table('usuarios')
        .get(req.body.correo)('pass')
        .eq(req.body.pass).not(),
          // then:
          false,
        // else:
        true)
      .run(conn, function (err, res2) {
        if (err) throw err;
        res.json(res2)
    })
  }).error(function(err) {
    throw err;
  })
});

app.listen(3000, () => {
  console.log("Escuchando en puerto 3000");
});