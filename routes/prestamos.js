const express = require('express');
const router = express.Router();
const Promise = require("bluebird");
const prestamo = require('../models/prestamo');
const array = [];
var aux=0;

//MODIFICAR CON EL NUEVO OBJETO QUE SE CREARÁ PARA CADA UNA DE LAS CONSULTAS DE CREDITO
router.get('/', (req, res, next) => {
  Promise.resolve()
  .then(function () {
    return prestamo.getCredito();
  })
  .then(function(data){
    res.json({success: true, datos: data, msg:"Operacion exitosa"});
  })
  .catch(function (err) {
    console.error("got error: " + err);
    if (err instanceof Error) {
      res.status(400).send("Error general");
      console.log(err);
    } else {
      res.status(200).json({ "code": 1000, "message": err });
    }
  });
});

router.post('/addcredito', (req, res, next) => {
  var nombreCredito = req.body.nombreCredito;
  var montoMin = req.body.montoMin;
  var montoMax = req.body.montoMax;
  var pagoAnticipado = req.body.pagoAnticipado;
  var pagosCredito = req.body.pagosCredito;

  Promise.resolve()
  .then(function () {
    var json = {
      "nombreCredito":nombreCredito,
      "montoMin":montoMin,
      "montoMax":montoMax,
      "pagoAnticipado":pagoAnticipado
    }
    return prestamo.addCredito(json);
  })
  .then(function () {
    return prestamo.getLastIdCredito();
  })
  .then(function (lastIdCredito) {
    var ultimoId = JSON.stringify(lastIdCredito[0].idCredito);

    return prestamo.addPagoCredito(ultimoId,pagosCredito);
  })
  .then(function () {
    return prestamo.getCredito();
  })
  .then(function(data){
    res.json({success: true, datos: data, msg:"Operacion exitosa"});
  })
  .catch(function (err) {
    console.error("got error: " + err);
    if (err instanceof Error) {
      res.status(400).send("Error general");
      console.log(err);
    } else {
      res.status(200).json({ "code": 1000, "message": err });
    }
  });
});

router.post('/deletecredito/:idCredito', (req, res, next) => {
  var idCredito = req.params.idCredito;

  Promise.resolve()
  .then(function () {
    return prestamo.deleteCredito(idCredito);
  })
  .then(function () {
    return prestamo.getCredito();
  })
  .then(function(data){
    res.json({success: true, datos: data, msg:"Operacion exitosa"});
  })
  .catch(function (err) {
    console.error("got error: " + err);
    if (err instanceof Error) {
      res.status(400).send("Error general");
      console.log(err);
    } else {
      res.status(200).json({ "code": 1000, "message": err });
    }
  });
});
//PENDIENTE
router.post('/modifycredito', (req, res, next) => {
  var idCredito = req.body.idCredito;
  var nombreCredito = req.body.nombreCredito;
  var montoMin = req.body.montoMin;
  var montoMax = req.body.montoMax;
  var pagoAnticipado = req.body.pagoAnticipado;
  var pagosTotales = req.body.pagosTotales;

  Promise.resolve()
  .then(function () {
    var json = {
      "nombreCredito": nombreCredito,
      "montoMin": montoMin,
      "montoMax": montoMax,
      "pagoAnticipado": pagoAnticipado
    }
    return prestamo.updateCredito(json,idCredito);
  })
  .then(function () {
    return prestamo.updatePagoCredito(idCredito,pagosTotales);
  })
  .then(function (){
    res.json({success: true, msg:"Operacion exitosa"});
  })
  .catch(function (err) {
    console.error("got error: " + err);
    if (err instanceof Error) {
      res.status(400).send("Error general");
      console.log(err);
    } else {
      res.status(200).json({ "code": 1000, "message": err });
    }
  });
});

router.get('/getcredito', (req, res, next) => {

  Promise.join(prestamo.getCredito(),prestamo.distinctIdCredito(),prestamo.getPagoCredito(),
    function(credito, idscreditos, pagoscreditos) {
      return jsonCredito(credito,idscreditos,pagoscreditos);
    })
  .then(function(data){
    res.json({success: true, datos: data, msg:"Operacion exitosa"});
  })
  .catch(function (err) {
    console.error("got error: " + err);
    if (err instanceof Error) {
      res.status(400).send("Error general");
      console.log(err);
    } else {
      res.status(200).json({ "code": 1000, "message": err });
    }
  });
});

// amortizacion y creditobalance
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
router.post('/amortizacioncreditobalance', (req, res, next) => {

var idCredito = req.body.idCredito;
var idProyecto = req.body.idProyecto;
var numeroPeriodo = req.body.numeroPeriodo;
var monto = req.body.monto;
var interes;
var pago;
var saldo;
var pagoCapital;
var capital;
var pagoT = [];
var TIR;
var pagoAnticipado;
var pagoTotal;

Promise.join(prestamo.getPagoAnticipado(idCredito),prestamo.getPagosCredito(idCredito),
  function(pagoanticipado, pagoscreditos) {
     pagoAnticipado = pagoanticipado[0].pagoAnticipado;
     pagoTotal = pagoscreditos;
    //Valores Iniciales para CAPITAL
      if (pagoAnticipado==1) {//Es 1 cuando no existen pagos anticipados
          capital = monto;
      }else {
          var pagoAntPorc = (pagoAnticipado)/(100);
          capital = monto - monto*pagoAntPorc;
      }
    //Valores Iniciales para porcentajes de pagos totales

    for (var i = 0; i < pagoTotal.length; i++) {
      pagoT.push(monto*((pagoTotal[i].pagosCredito)/(100)));
    }

for (var i = 0; i < pagoT.length; i++) {
      console.log("pagoT: "+pagoT[i]);
}
return console.log("ok");
  })
  //solo sirve para insertar en creditobalance
  .then(function () {
    var json = {
      "credito_idCredito":idCredito,
      "Proyectos_idProyecto":idProyecto,
      "numeroPeriodo":numeroPeriodo,
      "monto":monto
    }
    return prestamo.addCreditoBalance(json);
  })
  .then(function () {
    console.log("pagoAnticipado: "+pagoAnticipado);
for (var i = 0; i < pagoTotal.length; i++) {
  console.log("pagoTotal: "+pagoTotal[i].pagosCredito);
}
   return porcentajesPagos(monto,pagoAnticipado,pagoTotal);
  })
  .then(function (pagosTotales) {
     for (var i = 0; i < pagosTotales.length; i++) {
     console.log("pagosTotales: "+pagosTotales[i]);
     }
    TIR = IRR(pagosTotales);
    return console.log("hola");;
  })
  .then(function () {
    console.log("TIR: "+ TIR);
    return amortizacion(TIR,capital,pagoT,monto,pagoTotal);
            array.length=0;
  })
  .then(function (json) {
    return prestamo.addAmortizacion(numeroPeriodo,idProyecto,idCredito,json);
  })

.then(function(){
  res.json({success: true,  msg:"Operacion exitosa"});

})
.catch(function (err) {
  console.error("got error: " + err);
  if (err instanceof Error) {
    res.status(400).send("Error general");
    console.log(err);
  } else {
    res.status(200).json({ "code": 1000, "message": err });
    }
  });
});

router.post('/deletecreditobalance', (req, res, next) => {
  var idCredito = req.body.idCredito;
  var idProyecto = req.body.idProyecto;
  var numeroPeriodo = req.body.numeroPeriodo;
  Promise.resolve()
  .then(function () {
      return prestamo.deleteCreditoBalance(idCredito,idProyecto,numeroPeriodo);
  })
  .then(function(data){
    res.json({success: true, datos: data, msg:"Operacion exitosa"});
  })
  .catch(function (err) {
    console.error("got error: " + err);
    if (err instanceof Error) {
      res.status(400).send("Error general");
      console.log(err);
    } else {
      res.status(200).json({ "code": 1000, "message": err });
    }
  });
});
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
router.post('/veramortizacion', (req, res, next) => {

  var idCredito = req.body.idCredito;
  var idProyecto = req.body.idProyecto;
  var numeroPeriodo = req.body.numeroPeriodo;
  var monto;
  var interes;
  var pago;
  var saldo;
  var pagoCapital;
  var capital;
  var pagoT = [];
  var TIR;
  var pagoAnticipado;
  var pagoTotal;

  Promise.join(prestamo.getPagoAnticipado(idCredito),prestamo.getPagosCredito(idCredito),prestamo.getMonto(idCredito,idProyecto,numeroPeriodo),
    function(pagoanticipado, pagoscreditos, credito) {
       pagoAnticipado = pagoanticipado[0].pagoAnticipado;
       pagoTotal = pagoscreditos;
       monto = credito[0].monto;
      //Valores Iniciales para CAPITAL
        if (pagoAnticipado==1) {//Es 1 cuando no existen pagos anticipados
            capital = monto;
        }else {
            var pagoAntPorc = (pagoAnticipado)/(100);
            capital = monto - monto*pagoAntPorc;
        }
      //Valores Iniciales para porcentajes de pagos totales

      for (var i = 0; i < pagoTotal.length; i++) {
        pagoT.push(monto*((pagoTotal[i].pagosCredito)/(100)));
      }

  for (var i = 0; i < pagoT.length; i++) {
        console.log("pagoT: "+pagoT[i]);
  }
  return console.log("ok");
    })

    .then(function () {
      console.log("pagoAnticipado: "+pagoAnticipado);
  for (var i = 0; i < pagoTotal.length; i++) {
    console.log("pagoTotal: "+pagoTotal[i].pagosCredito);
  }
     return porcentajesPagos(monto,pagoAnticipado,pagoTotal);
    })
    .then(function (pagosTotales) {
       for (var i = 0; i < pagosTotales.length; i++) {
       console.log("pagosTotales: "+pagosTotales[i]);
       }
      TIR = IRR(pagosTotales);
      return console.log("hola");;
    })
    .then(function () {
      console.log("TIR: "+ TIR);
      return amortizacion(TIR,capital,pagoT,monto,pagoTotal);
    })
  .then(function(data){
    res.json({success: true, datos: data, msg:"Operacion exitosa"});
    array.length=0;
  })
  .catch(function (err) {
    console.error("got error: " + err);
    if (err instanceof Error) {
      res.status(400).send("Error general");
      console.log(err);
    } else {
      res.status(200).json({ "code": 1000, "message": err });
    }
  });
});

function IRR(CArray) {

  min = 0.0;
  max = 1.0;
  do {
    guest = (min + max) / 2;
    NPV = 0;
    for (var j=0; j<CArray.length; j++) {
          NPV += CArray[j]/Math.pow((1+guest),j);
    }
    if (NPV > 0) {
      min = guest;
    }
    else {
      max = guest;
    }
  } while(Math.abs(NPV) > 0.000001);
  return guest;
}

//pago anticipado es un número que deberá expresarse en %
//pagoTotal
function porcentajesPagos(monto,pagoAnticipado,pagoTotal) {
  var pagoT = [];

  if (pagoAnticipado==1) {//Es 1 cuando no existen pagos anticipados
      pagoT.push(-monto);
  }else {
      var pagoAntPorc = (pagoAnticipado)/(100);
      var pagoA = monto - monto*pagoAntPorc;
      pagoT.push(-pagoA);
  }

  for (var i = 0; i < pagoTotal.length; i++) {
    pagoT.push(monto*((pagoTotal[i].pagosCredito)/(100)));
  }
  return pagoT;
}

function amortizacion(TIR,capital,pagoT,monto,pagoTotal) {

  var capital2 = Math.round(capital);

  interes = (capital*TIR);
  var interes2 = Math.round(interes);

  saldo = (capital + interes - pagoT[aux]);
  var saldo2 = saldo.toFixed(2);
  saldo2 = Math.round(saldo);

  pagoCapital = pagoT[aux] - interes;
  var pagoCapital2 = Math.round(pagoCapital);

  console.log("capital: "+capital);
  console.log("interes: "+interes);
  console.log("pago: "+pagoT[aux]);
  console.log("saldo: "+saldo);
  console.log("pagoCapital: "+pagoCapital);

  var json = {
    "capital":capital2,
    "interes":interes2,
    "pago":pagoT[aux],
    "saldo":saldo2,
    "pagoCapital":pagoCapital2
  };

  toJSON(json)

  while (saldo>0) {
    aux = aux + 1;
    capital = saldo;
    amortizacion(TIR,capital,pagoT,monto,pagoTotal);
  }
  return array;
}

function toJSON(json) {
  return array.push(json);
}

function jsonCredito(credito,idscreditos,pagoscreditos) {

  var repIdCreditos = [];//almacena las veces que se repite un idCredito en pagoCredito

  var i = 0;
  while (i<idscreditos.length) {
    var aux = 0;
    for (var j = 0; j < pagoscreditos.length; j++) {
      if (idscreditos[i].idCredito == pagoscreditos[j].idCredito) {
        aux = aux +1;
      }
    }
    repIdCreditos.push(aux);
    i++;
  }
//console.log(repIdCreditos);

  var creditosArray = []
  var k = 0;

  while (k < idscreditos.length) {
    for (var i = 0; i < credito.length; i++) {
      if (idscreditos[k].idCredito == credito[i].idCredito) {
        var json = {
          "idCredito":credito[i].idCredito,
          "nombreCredito":credito[i].nombreCredito,
          "montoMin":credito[i].montoMin,
          "montoMax":credito[i].montoMax,
          "pagoAnticipado":credito[i].pagoAnticipado,
          "pagosTotales":[]
        }
      creditosArray.push(json);
      }
    }
    k++;
  }

//console.log(creditosArray);

var aux2 = 0;
for (var j = 0; j < repIdCreditos.length; j++) {
  for (var k = 0; k < (repIdCreditos[j]); k++) {
    var json = {
      "idPagoCredito":pagoscreditos[aux2].idPagoCredito,
      "pagosCredito":pagoscreditos[aux2].pagosCredito
    }
    creditosArray[j]['pagosTotales'].push(json);
    aux2 = aux2 + 1;
  }
}
//console.log(creditosArray);
  return creditosArray;
}

module.exports = router;
