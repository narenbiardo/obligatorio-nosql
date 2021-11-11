const bcrypt = require('bcrypt');
var r = require('rethinkdb');
var express = require('express');
var funciones = require('./funciones.js');
var operaciones = require('./operaciones.js');
var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var p = r.connect({ host: 'localhost', port: 28015, db: 'test' });

module.exports = {
    checkUserMail: async function (correo, pass, roles, res, operacion) {
        p.then(function (conn) {
            r.table('usuarios')
                .get(correo)
                .eq(null)
                .run(conn, function (err, res2) {
                    if (err) throw err;
                    if (res2 == true) {
                        r.table('errores')
                            .get(102)
                            .run(conn, function (err, res2) {
                                if (err) throw err;
                                res.json(res2)
                            })
                    } else {
                        if(operacion == "agregarRoles"){
                            operaciones.agregarRoles(correo, pass, roles, res);
                        }else{
                            operaciones.eliminarRoles(correo, pass, roles, res);
                        }
                    }
                })
        }).error(function (err) {
            throw err;
        })
    }
}
