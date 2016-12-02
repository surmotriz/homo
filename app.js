var express = require('express')
var oracledb = require('oracledb')
var firebase = require('firebase')
var fs = require('fs')
var AdmZip = require('adm-zip')
var app = express()

var conexion = {
    user            :       'dti',
    password        :       'dti',
    connectString   :       '192.168.40.47/xe'
}

app.get('/', function(req,res){    
    res.send(new Date())
})


var zip = new AdmZip();
zip.addFile("test.xml", new Buffer("inner content of the file"), "entry comment goes here", 0644 << 16);
zip.addFile("moises.jpg", fs.readFileSync('./moises.jpg') , "entry comment goes here", 0644 << 16);
zip.writeZip("./files.zip");

setInterval(function(){
    oracledb.getConnection(conexion, function (err, conexion) {
        conexion.execute(
            "BEGIN PKG_ELECTRONICA.ENVIOS(:fecha,:envios); END;",
            {
                fecha: { val: 'N', type:oracledb.STRING },
                envios: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
            },
            function (err, result){
                result.outBinds.envios.getRows(1000,
                    function(err, rows){
                        var invoice = '';
                        for(var i=0; i<=(rows.length-1); ++i){
                            for(var h=0; h<=(rows[i].length-1); ++h){
                                invoice += rows[i][h];
                            }
                            console.log(invoice);
                        }                        
                    }
                )
            }
        );
    });
}, 2000);



app.listen(3000, function(){
    console.log("Servidor Corriendo en http://localhost:3000");
})