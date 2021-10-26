var r = require('rethinkdb');
var express = require('express');
var app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// r.connect({ host: 'localhost', port: 28015 }, function(err, conn) {
//   if(err) throw err;
//   r.db('test').tableCreate('tv_shows').run(conn, function(err, res) {
//     if(err) throw err;
//     console.log(res);
//     r.table('tv_shows').insert({ name: 'Star Trek TNG' }).run(conn, function(err, res)
//     {
//       if(err) throw err;
//       console.log(res);
//     });
//   });
// });

var p = r.connect({ host: 'localhost', port: 28015, db: 'test'});

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

app.listen(3000, () => {
  console.log("Corriendo en puerto 3000");
});