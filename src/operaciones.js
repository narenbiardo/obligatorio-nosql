const bcrypt = require('bcrypt');
var r = require('rethinkdb');
var express = require('express');
var funciones = require('./funciones.js');
var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var p = r.connect({ host: 'localhost', port: 28015, db: 'test' });

module.exports = {
    agregarRoles: async function (correo, pass, roles, res) {
        p.then(function (conn) {
            r.table('usuarios')
                .get(correo)('pass')
                .run(conn, async function (err, res2) {
                    if (err) throw err;
                    funciones.compareHashedpass(pass, res2).then(response => {
                        if (response) {
                            p.then(function (conn) {
                                r.table('usuarios')
                                    .get(correo)
                                    .update({ roles: r.row('roles').default([]).setUnion(roles) })
                                    .run(conn, function (err, res2) {
                                        if (err) throw err;
                                        res.json(res2);
                                    })
                            }).error(function (err) {
                                throw err;
                            })
                        } else {
                            r.table('errores')
                                .get(104)
                                .run(conn, function (err, res2) {
                                    if (err) throw err;
                                    res.json(res2)
                                })
                        }
                    })
                })
        })
    },
    eliminarRoles: async function (correo, pass, roles, res) {
        p.then(function (conn) {
            r.table('usuarios')
                .get(correo)('pass')
                .run(conn, async function (err, res2) {
                    if (err) throw err;
                    funciones.compareHashedpass(pass, res2).then(response => {
                        if (response) {
                            p.then(function (conn) {
                                var countRolesReq = roles.length;
                                r.branch(
                                    //if
                                    r.table('usuarios')
                                        .get(correo)('roles')
                                        .setIntersection(roles)
                                        .count()
                                        .eq(countRolesReq).not(),
                                    //then
                                    r.table('errores')
                                        .get(103),
                                    // else:
                                    r.table('usuarios')
                                        .get(correo)
                                        .update({ roles: r.row('roles').difference(roles) }))
                                    .run(conn, function (err, res2) {
                                        if (err) throw err;
                                        res.json(res2)
                                    })
                            }).error(function (err) {
                                throw err;
                            })
                        } else {
                            r.table('errores')
                                .get(104)
                                .run(conn, function (err, res2) {
                                    if (err) throw err;
                                    res.json(res2)
                                })
                        }
                    })
                })
        }).error(function (err) {
            throw err;
        })
    },
    autenticarUsuario: async function (correo, pass, res) {
        p.then(async function (conn) {
            r.branch(
                // if
                r.table('usuarios')
                    .get(correo)
                    .eq(null),
                // then:
                false,
                // else
                r.table('usuarios')
                    .get(correo)('pass'))
                .run(conn, async function (err, res2) {
                    if (err) throw err;
                    if (res2 == false) {
                        res.json(false);
                    } else {
                        funciones.compareHashedpass(pass, res2).then(response => res.json(response));
                    }
                })
        })
    },
    agregarUsuario: async function (correo, pass, nombre, apellido, res) {
        funciones.passToHash(pass).then(hashedPass =>
            p.then(function (conn) {
                r.branch(
                    // if
                    r.table('usuarios')
                        .get(correo)
                        .eq(null).not(),
                    // then:
                    r.table('errores')
                        .get(101),
                    // else:
                    r.table('usuarios')
                        .insert({
                            correo: correo,
                            pass: hashedPass,
                            nombre: nombre,
                            apellido: apellido,
                            roles: []
                        }))
                    .run(conn, function (err, res2) {
                        if (err) throw err;
                        res.json(res2);
                    })
            }).error(function (err) {
                throw err;
            }));
    },
    codigosDeError: async function (res) {
        p.then(function (conn) {
            r.table('errores')
                .orderBy('error')
                .run(conn, function (err, res2) {
                    if (err) throw err;
                    res.json(res2);
                })
        }).error(function (err) {
            throw err;
        });
    }

}