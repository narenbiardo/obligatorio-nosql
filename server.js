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
    'Error 103: al eliminar uno o más roles de un usuario, al menos uno de los roles ingresados no existen para ese usuario',
    'Error 104: al agregar o eliminar roles, o al autenticar a un usuario, la contraseña ingresada es errónea'
  ]
  res.json(errores)
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
          "Error 101",
      // else if
      r.table('usuarios')
        .get(req.body.correo)('pass')
        .eq(req.body.pass),
          // then:
          "Error 104",
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
          "Error 102",
      // else if
      r.table('usuarios')
        .get(req.body.correo)('pass')
        .eq(req.body.pass).not(),
          // then:
          "Error 104",
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
    r.branch( // el branch de RethinkDB es una estructura para condicionales
      // if
      r.table('usuarios')
        .get(req.body.correo)
        .eq(null),
          // then:
          "Error 102",
      // else if
      r.table('usuarios')
        .get(req.body.correo)('pass')
        .eq(req.body.pass).not(),
          // then:
          "Error 104",
      // else if, roles que traigo del body request != roles del usuario
      r.table('usuarios')
        .get(req.body.correo)('roles')
        .setIntersection(req.body.roles)
        .count()
        .eq(countRolesReq).not(),
          // then
          "Error 103",
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
//

app.listen(3000, () => {
  console.log("Escuchando en puerto 3000");
});













// IGNORAR!!
//
//
// Listar usuarios - NO VA PARA EL OBLIGATORIO
// app.get("/usuarios", (req, res) => {
//   p.then(function(conn) {
//     r.table('usuarios')
//       .run(conn, function (err, cursor) {
//         if (err) throw err;
//         cursor.toArray(function(err, res2){
//           if (err) throw err;
//           res.json(res2)
//         });
//     })
//   }).error(function(err) {
//     throw err;
//   });
// });

// // Detalle usuario - NO VA
// app.get('/usuarios:id', (req, res) => {
//   p.then(function(conn) {
//     r.table('usuarios')
//       .get(req.body.correo)
//       .run(conn, function (err, res2) {
//         if (err) throw err;
//         res.json(res2);
//     })
//   }).error(function(err) {
//     throw err;
//   });
// });

// // Eliminar usuario - NO VA
// app.delete('/usuarios:id', (req, res) => {
//   p.then(function(conn) {
//     r.table('usuarios')
//       .get(req.body.correo)
//       .delete()
//       .run(conn, function (err, res2) {
//         if (err) throw err;
//         res.json(res2);
//     })
//   }).error(function(err) {
//     throw err;
//   });
// });