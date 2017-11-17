const express = require('express');
const router = express.Router();
const balance = require('../models/balance');
const operacion = require('../models/operacion');
const auxiliar = require('../models/auxiliar');
const prestamo = require('../models/prestamo');
const Promise = require("bluebird");

router.post('/register', (req, res, next) => {
  Promise.resolve().then( function () {
    var json = req.body;
    return balance.addBalance(json);
  }).then( function () {
    res.json({success: true, msg:"Operacion exitosa"});
  }).catch(function (err) {
    console.log(err);
    res.json({success:false, msg:"Operacion incompleta"});
  });
});

router.post('/modify/:id', (req,res,next) => {
  Promise.resolve().then( function () {
    var id = req.params.id;
    var cambios = req.body;
    return balance.updateBalance(id,cambios);
  }).then( function () {
    res.json({success: true,msg:"Operacion exitosa"});
  }).catch(function (err) {
    console.log(err);
    res.json({success:false, msg:"Operacion incompleta"});
  });
});

router.post('/', (req,res,next) => {
  Promise.resolve().then( function () {
    var idProyecto = req.body.idProyecto;
    var numeroPeriodo = req.body.numeroPeriodo;
    return balance.getBalanceById(idProyecto, numeroPeriodo);
  }).then(function (rows) {
    res.json({success: true, datos:rows, msg:"Operacion exitosa"});
  })
  .catch(function (err) {
    console.log(err);
    res.json({success:false, msg:"Operacion incompleta"});
  });
});

router.post('/getactivos', (req,res,next) => {
  Promise.resolve().then( function () {
    var idProyecto = req.body.idProyecto;
    var numeroPeriodo = req.body.numeroPeriodo;
    return balance.getActivos(idProyecto, numeroPeriodo);
  }).then(function(rows){
    return jsonActivos(rows);
  }).then(function (rows) {
    res.json({success: true, datos:rows, msg:"Operacion exitosa"});
  })
  .catch(function (err) {
    console.log(err);
    res.json({success:false, msg:"Operacion incompleta"});
  });
});

router.post('/getpasivos', (req,res,next) => {
  Promise.resolve().then( function () {
    var idProyecto = req.body.idProyecto;
    var numeroPeriodo = req.body.numeroPeriodo;
    return balance.getPasivos(idProyecto, numeroPeriodo);
  }).then(function(rows){
    return jsonPasivos(rows);
  }).then(function (rows) {
    res.json({success: true, datos:rows, msg:"Operacion exitosa"});
  })
  .catch(function (err) {
    console.log(err);
    res.json({success:false, msg:"Operacion incompleta"});
  });
});

router.post('/final', (req, res, next) => {
  var idProyecto = req.body.idProyecto;
  var numeroPeriodoAnterior = req.body.numeroPeriodo;
  var numeroPeriodoActual = req.body.numeroPeriodo + 1;

  console.log(idProyecto,numeroPeriodoActual,numeroPeriodoAnterior);

  Promise.join(balance.getBalanceById(idProyecto,numeroPeriodoAnterior),
              prestamo.getFinanciamientos(idProyecto,numeroPeriodoActual),
              prestamo.getPagos(idProyecto,numeroPeriodoActual),
              auxiliar.getAuxiliar(numeroPeriodoActual,idProyecto),
              auxiliar.getAuxiliaresVenta(numeroPeriodoActual,idProyecto), function(balanceBase,prestamos,pagos,auxCompleto,auxesVentas){

    //prestamos
    var cantidadPrestada = 0;
    var cantidadPrestadaAmenosAnio = 0;
    for(let key in prestamos){
      if(prestamos[key].plazo == 1){
        cantidadPrestadaAmenosAnio += prestamos[key].monto;
      }
      else{
      cantidadPrestada += prestamos[key].monto;
      }
    }

    //Intereses de Anticipo
    var interesesAnticipo = 0;
    for(let key in prestamos){
      interesesAnticipo += prestamos[key].anticipo;
    }

    //Pago de Prestamos
    var PPagar = 0;
    var PPagarAmenosAnio = 0;
    for(let key in pagos){
      if(pagos[key].tipo == 1){
        if(pagos[key].plazo == 1){
          PPagarAmenosAnio += pagos[key].pagoCapital + pagos[key].intereses;
        }
        else{
          PPagar += pagos[key].pagoCapital + pagos[key].intereses;
        }
      }
      else{
      PPagar += pagos[key].pagoCapital;
      }
    }

    //Intereses de Pago
    var interesesPago = 0;
    for(let key in pagos){
      if(pagos[key].tipo != 1){
      interesesPago += pagos[key].intereses;
      }
    }

    var IVAxEnterar = getIVAxEnterar(auxCompleto[0],auxesVentas);
    var proveedores = getProveedores(auxesVentas);
    var salidas = getSalidas(auxesVentas);
    var maq = balanceBase[0].maqEquipo + (auxCompleto[0].compraMaquinaria+auxCompleto[0].IVACompraMaq);
    var cuentasPorCobrar = getCuentasPorCobrar(auxesVentas);
    var almacenArtTerm = getAlmacenTerm(auxesVentas);
    var utlidadAcumulada = balanceBase[0].utilidadEjercicio + balanceBase[0].utilidadAcum;
    var maqEquipo = balanceBase[0].depMaqEquipo + auxCompleto[0].costoTransformacionMaq;
    var utilidadEjercicio = getUtilidad(auxCompleto[0],auxesVentas)-balanceBase[0].almacenArtTerm-interesesAnticipo-interesesPago;


    //ISR y PTU
    var ISR = 0;
    var PTU = 0;
    var ISRCajaBancos = 0;
    var imptsPorPagar = 0;
    if(utilidadEjercicio > 0){
      var utilidadVerdadera = utilidadEjercicio - utlidadAcumulada;
      if(utilidadVerdadera > 0){
        ISR = utilidadVerdadera * .34;
        PTU = utilidadVerdadera * .10;
        imptsPorPagar = (ISR/12);
        ISRCajaBancos = imptsPorPagar * 11;
        utilidadEjercicio = utilidadEjercicio - ISR - PTU;
      }
    }

    var cobroPorVentasCajaBancos = cuentasPorCobrar * 11;
    var IVACajaBancos = IVAxEnterar * 11;
    var prestamosMasAnio = balanceBase[0].prestamosMasAnio + cantidadPrestada - PPagar;
    var prestamosMenosAnio = balanceBase[0].prestamosMenosAnio + cantidadPrestadaAmenosAnio - PPagarAmenosAnio;
    var comprasCajaBancos = proveedores*11;
    var maqYdesarrollos = auxCompleto[0].compraMaquinaria + (-auxCompleto[0].IVAGastosVenta + auxCompleto[0].desarrolloMercado + auxCompleto[0].desarrolloProducto);
    var depE = balanceBase[0].depEdif + (getDepEdif(auxesVentas) * .5);
    var depME = balanceBase[0].depMueblesEnseres + (getDepEdif(auxesVentas) * .5);
    var depT = balanceBase[0].depEqTrans + getDepTrans(auxesVentas);

    var cajaBancos = balanceBase[0].cajaBancos + (cantidadPrestada+cantidadPrestadaAmenosAnio-interesesAnticipo)- PPagar -PPagarAmenosAnio - interesesPago - ISRCajaBancos - balanceBase[0].PTUPorPagar - balanceBase[0].imptosPorPagar + balanceBase[0].cuentasPorCobrar - balanceBase[0].proveedores - balanceBase[0].IVAPorEnterar + cobroPorVentasCajaBancos - IVACajaBancos - comprasCajaBancos - maqYdesarrollos - salidas;

    var x = {
      imptosPorPagar:imptsPorPagar,
      PTUPorPagar:PTU,
      prestamosMasAnio:prestamosMasAnio,
      prestamosMenosAnio:prestamosMenosAnio,
      maqEquipo:maq,
      IVAPorEnterar:IVAxEnterar,
      proveedores:proveedores,
      cajaBancos:cajaBancos,
      cuentasPorCobrar:cuentasPorCobrar,
      depMaqEquipo:maqEquipo,
      almacenArtTerm:almacenArtTerm,
      utilidadAcum:utlidadAcumulada,
      utilidadEjercicio:utilidadEjercicio,
      depEdif:depE,
      depMueblesEnseres:depME,
      depEqTrans:depT
    }
    balance.updateBalance(numeroPeriodoActual, idProyecto, x);
  }).then( function () {
    res.json({success:true, msg:"Operacion exitosa"});
  })
  .catch(function(err) {
    console.log(err);
    res.json({success: false, msg:"Operacion incompleta"});
  })
});


router.get('/:id', (req,res,next) => {
  Promise.resolve().then( function () {
    return balance.getBalances(req.params.id);
  }).then( function (rows) {
    res.json({success: true, datos:rows, msg:"Operacion exitosa"});
  }).catch(function (err) {
    console.log(err);
    res.json({success:false, msg:"Operacion incompleta"});
  });
});

function getDepEdif(auxV){
  var dep = 0;
  for (let key in auxV) {
    dep += (auxV[key].costoAdministrativo - auxV[key].costoAdminDep);
  }
  return dep;
}

function getDepTrans(auxV){
  var dep = 0;
  for (let key in auxV) {
    dep += (auxV[key].costoDistribucion - auxV[key].costoDistDep);
  }
  return dep;
}

function getSalidas(auxV){
  var salidas = 0;
  for (let key in auxV) {
    salidas += auxV[key].costoTransformacionVentas;
    salidas += auxV[key].costoDistDep;
    salidas += auxV[key].costoAdminDep;
    salidas -= auxV[key].IVATrans;
    salidas -= auxV[key].IVADist;
    salidas -= auxV[key].IVAAdmon;
  }
  return salidas;
}

function getUtilidad(aux,auxV){
    var utilidad = 0;
    var transMaqVentas = 0;
    for (let key in auxV) {
      utilidad -= auxV[key].costoDistribucion;
      utilidad -= auxV[key].costoAdministrativo;
      utilidad -= auxV[key].costoVentas;
      utilidad += (auxV[key].Ventas-auxV[key].IVAxVentas);
      transMaqVentas += auxV[key].costoTransformacionMaq;
    }
    if(transMaqVentas != aux.costoTransformacionMaq){
      utilidad -= (aux.costoTransformacionMaq - transMaqVentas);
    }

    return (utilidad - aux.desarrolloProducto - aux.desarrolloMercado);
}

function getIVAxEnterar(aux,auxV){
  var ivaV = 0;
  var ivaCom = 0;
  var ivaTrans = 0;
  var ivaDist = 0;
  var ivaMaq = aux.IVACompraMaq;
  var ivaAdmin = 0;
  var ivaGV = aux.IVAGastosVenta;
  for (let key in auxV) {
    ivaV += auxV[key].IVAxVentas;
    ivaCom += auxV[key].IVACompras;
    ivaTrans += auxV[key].IVATrans;
    ivaDist += auxV[key].IVADist;
    ivaAdmin += auxV[key].IVAAdmon;
  }
  var ivaT = ivaV +ivaCom +ivaTrans +ivaDist +ivaMaq +ivaAdmin +ivaGV;

  return ivaT/12;
}

function getProveedores(auxV){
  var Comp = 0;
  for (let key in auxV) {
      Comp += auxV[key].Compras;
  }
  var CompTotal = Comp/12;
  return CompTotal;
}

function getCuentasPorCobrar(auxV){
  var Comp = 0;
  for (let key in auxV) {
      Comp += auxV[key].Ventas;
  }
  var CompTotal = (Comp)/12;
  return CompTotal;
}

function getAlmacenTerm(auxV){
  var Comp = 0;
  for (let key in auxV) {
      Comp += auxV[key].inventarioFinal;
  }
  return Comp;
}

function jsonActivos(rows) {
  var activ = [];
  activ.push(name:"Caja y Bancos",value:rows[0].cajaBancos);
  activ.push(name:"Cuentas Por Cobrar",value:rows[0].cuentasPorCobrar);
  activ.push(name:"IVA Acreditable",value:rows[0].IVAAcreditable);
  activ.push(name:"Almacen de articulo terminado",value:rows[0].almacenArtTerm);
  return activ;
}

function jsonPasivos(rows) {
  var activ = [];
  activ.push(name:"IVA por enterar",value:rows[0].IVAPorEnterar);
  activ.push(name:"Impuestos por pagar",value:rows[0].imptosPorPagar);
  activ.push(name:"Proveedores",value:rows[0].proveedores);
  activ.push(name:"Prestamos a menos de un año",value:rows[0].prestamosMenosAnio);
  activ.push(name:"Prestamos a mas de un año",value:rows[0].prestamosMasAnio);
  return activ;
}

module.exports = router;
