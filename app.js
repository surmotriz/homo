var express = require('express')
var oracledb = require('oracledb')
var firebase = require('firebase')
var app = express()

var conexion = {
    user            :       'dti',
    password        :       'dti',
    connectString   :       '192.168.0.22/xe'
}

app.get('/', function(req,res){
    //res.send("Hola Mundo");
    res.send(new Date())
})


var i = 1
setInterval(function(){
    oracledb.getConnection(conexion, function (err, conexion) {
        conexion.execute(
            "BEGIN PKG_ELECTRONICA.ENVIOS(:fecha,:envios); END;",
            {             
                fecha: { val: 'N', type:oracledb.STRING },                               
                envios: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
            },
            function (err, result) {
                result.outBinds.envios.getRows(1000,
                    function(err, rows){
                        var invoice = '';
                        for(var h=0; h<=rows[0].length; ++h){
                            invoice += rows[0][h];                             
                        }
                        console.log(invoice);
                                               
                    }
                )
            }
        );
    });    
    i++
}, 2000);


app.get('/envios/:fecha/', function(req, res){
    oracledb.getConnection(conexion, function (err, conexion) {
        conexion.execute(
            "BEGIN PKG_ELECTRONICA.ENVIOS(:fecha,:envios); END;",
            {             
                fecha: { val: req.params.fecha, type:oracledb.STRING },                               
                envios: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
            },
            function (err, result) {
                result.outBinds.envios.getRows(
                    1000,
                    function(err, rows){
                        res.send(rows);
                    }
                )
            }
        );
    });
});

app.get('/docs/:gen/:emp/:pag/:fecha1/:fecha2/', function(req, res){
    oracledb.getConnection(conexion, function (err, conexion) {
        conexion.execute(
            "BEGIN PKG_ELECTRONICA.DOCS(:gen, :emp, :pag, :fecha1, :fecha2, :docs); END;",
            {
                gen: { val: req.params.gen, type:oracledb.STRING },
                emp: { val: req.params.emp, type:oracledb.STRING },
                pag: { val: req.params.pag, dir:oracledb.BIND_IN }, 
                fecha1: { val: req.params.fecha1, type:oracledb.STRING },
                fecha2: { val: req.params.fecha2, type:oracledb.STRING },                               
                docs: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
            },
            function (err, result) {
                result.outBinds.docs.getRows(
                    1000,
                    function(err, rows){
                        res.send(rows);
                    }
                )
            }
        );
    });
});

app.listen(3000, function(){
    console.log("Servidor Corriendo en http://localhost:3000");
})