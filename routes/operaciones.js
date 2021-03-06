const express = require('express');
const router = express.Router();
const config = require('../config/db');
const operacion = require('../models/operacion');
const auxiliar = require('../models/auxiliar');
const variable = require("../models/variable");
const prestamo = require('../models/prestamo');
const Promise = require("bluebird");

router.post('/register', (req, res, next) => {
  var idProducto = req.body.Producto_idProducto;
  var idZona = req.body.Zona_idZonas;
  var idProyecto = req.body.Proyecto_idProyecto;
  var idUsuario = req.body.Usuario_idUsuario;
  var numeroPeriodo = req.body.numeroPeriodo;
  var uniVendidas = req.body.unidadesVendidas;

  Promise.resolve().then(function(){
    return operacion.getOperacion(idProyecto,idUsuario,numeroPeriodo,idProducto,idZona);
  }).then(function (rows) {
    if(rows.length == 0){
      var json = req.body;
      return operacion.addOperacion(json);
    }
    else{
      return operacion.updateOperacion(idProducto,idZona,idProyecto,idUsuario,numeroPeriodo,uniVendidas);
    }
  })
  .then(function () {
    return operacion.getOperaciones(idProyecto,idUsuario,numeroPeriodo);
  })
  .then(function (rows) {
    res.json({success: true, datos:rows, msg:"Operacion exitosa"});
  })
  .catch(function (err) {
    console.error("got error: " + err);
    res.json({success:false,msg:"No sirve"});
  });
});


router.post('/getAlmacen', (req,res,next) => {
  var idProyecto = req.body.Proyecto_idProyecto;
  var numeroPeriodo = req.body.Balance_numeroPeriodo;
  Promise.resolve().then(function(){
    return operacion.getAlmacenes(idProyecto,numeroPeriodo);
  })
  .then(function (rows) {
    res.json({success: true, datos:rows, msg:"Operacion exitosa"});
  })
  .catch(function (err) {
    console.error("got error: " + err);
    res.json({success:false,msg:"No sirve"});
  });
});

router.post('/registerAlmacen', (req, res, next) => {
  var idProducto = req.body.Producto_idProducto;
  var idProyecto = req.body.Proyecto_idProyecto;
  var numeroPeriodo = req.body.Balance_numeroPeriodo;
  var uniA = req.body.unidadesAlmacenadas;

  Promise.resolve().then(function(){
    return operacion.getAlmacen(idProyecto,idProducto,numeroPeriodo);
  }).then(function (rows) {
    if(rows.length == 0){
      var json = req.body;
      return operacion.addAlmacen(json);
    }
    else{
      return operacion.updateAlmacen(uniA,idProducto,idProyecto,numeroPeriodo);
    }
  })
  .then(function () {
    return operacion.getAlmacenes(idProyecto,numeroPeriodo);
  })
  .then(function (rows) {
    res.json({success: true, datos:rows, msg:"Operacion exitosa"});
  })
  .catch(function (err) {
    console.error("got error: " + err);
    res.json({success:false,msg:"No sirve"});
  });
});

router.post('/getAll/', (req, res, next) => {
  Promise.resolve().then(function() {
    var idProyecto = req.body.idProyecto;
    var idUsuario = req.body.idUsuario;
    var numeroPeriodo = req.body.numeroPeriodo;
    return operacion.getOperaciones(idProyecto,idUsuario,numeroPeriodo);
  }).then(function (rows) {
    res.json({success: true, datos:rows, msg:"Operacion exitosa"});
  })
  .catch(function (err) {
    console.error(err);
    res.json({msg:"Algo salió mal"});
  });
});

router.post('/getventas', (req,res,next) => {
  Promise.resolve().then(function () {
    var idProyecto = req.body.Proyectos_idProyecto;
    var numeroPeriodo = req.body.Balance_numeroPeriodo;
    return auxiliar.getAuxiliaresVenta(numeroPeriodo,idProyecto);
  }).then(function (rows) {
    res.json({success:true, datos:rows, msg:"Exito"});
  }).catch(function(err){
    console.log(err);
    res.json({success:false, msg:"Fail"});
  })
})

router.post('/getauxiliar', (req,res,next) => {
  Promise.resolve().then(function () {
    var idProyecto = req.body.Proyectos_idProyecto;
    var numeroPeriodo = req.body.Balance_numeroPeriodo;
    return auxiliar.getAuxiliares(numeroPeriodo,idProyecto);
  }).then(function(rows){
    res.json({success:true, datos:rows, msg:"Exito"});
  }).catch(function(err){
    console.log(err);
    res.json({success:false, msg:"Fail"});
  })
})

router.post('/modify', (req, res, next) => {

  Promise.resolve()
  .then(function () {
    var idProducto = req.body.Producto_idProducto;
  	var idZona = req.body.Zona_idZonas;
  	var idProyecto = req.body.Proyecto_idProyecto;
  	var idUsuario = req.body.Usuario_idUsuario;
  	var numeroPeriodo = req.body.numeroPeriodo;
    var uniVendidas = req.body.unidadesVendidas;

    return operacion.updateOperacion(idProducto,idZona,idProyecto,idUsuario,numeroPeriodo,uniAlmacenadas,uniVendidas);
  })
  .then(function () {
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

router.post('/resultados', (req,res,next) => {
  var idProyecto = req.body.idProyecto;
  var numeroPeriodo = req.body.numeroPeriodo;
  Promise.join(operacion.getProductoCuentaVenta(idProyecto,numeroPeriodo),operacion.getProductoCuenta(idProyecto,numeroPeriodo),
  operacion.getProductoMaquinaria(idProyecto,numeroPeriodo),
              function(rows1,rows2,r3){
                return jsonProductos(rows1,rows2,r3);
              }).then(function(salida){
                return res.json({success:true,datos:salida,msg:"Bien"});
              }).catch(function(err) {
                console.log(err);
                return res.json({success:false,msg:"Algo salió mal"});
              });
});

router.post('/getdemanda', (req,res,next) => {
  Promise.resolve().then(function(){
    var idProducto = req.body.Producto_idProducto;
    var idZona = req.body.Zona_idZonas;
    var numeroPeriodo = req.body.numeroPeriodo;
    return operacion.getDemandaPotencial(numeroPeriodo,idProducto,idZona);
  }).then(function(demanda){
    var r = demanda[0].cantidad;
    return res.json({success:true,demanda:r});
  }).catch(function(err){
    console.log(err);
    return res.json({success:false,msg:"Algo salió mal"});
  })
});


router.post('/validateAlmacen', (req,res,next) => {
  var idProducto = req.body.Producto_idProducto;
  var idProyecto = req.body.Proyecto_idProyecto;
  var numeroPeriodo = req.body.Balance_numeroPeriodo;
  var periodoAnterior = numeroPeriodo - 1;
  var uniA = req.body.unidadesAlmacenadas;

  Promise.join(operacion.getMaquinarias(idProducto,idProyecto,numeroPeriodo), operacion.getAlmacen(idProyecto,idProducto,periodoAnterior),
              operacion.getUnidadesVendidas(idProyecto,idProducto,numeroPeriodo),
              function(maquinas,almacenAnterior,ventasTotales){

                var uniVendidas = getVentasAnteriores(ventasTotales);
                var uniAlmacenadas = 0
                if(almacenAnterior.length != 0){
                  uniAlmacenadas = almacenAnterior[0].unidadesAlmacenadas;
                }
                var produccionA = getProduccion(maquinas);

                var uniProd = uniVendidas + uniA;
                var uniDisponibles = produccionA + uniAlmacenadas;
                console.log(uniDisponibles,uniProd);
                if(uniProd > uniDisponibles){
                  res.json({success:false,msg:"Maquinaria Insuficiente, reduce la cantidad a almacenar o compra más maquinaria"});
                }
                else{
                  res.json({success:true,msg:"Puedes almacenar"});
                }
  }).catch(function(err) {
    console.log(err);
    return res.json({success:false,msg:"Algo salio mal"});
  })
});

router.post('/validate', (req,res,next) => {
  var idProducto = req.body.Producto_idProducto;
  var idProyecto = req.body.Proyecto_idProyecto;
  var idZona = req.body.Zona_idZonas;
  var numeroPeriodo = req.body.numeroPeriodo;
  var uniVendidas = req.body.unidadesVendidas;
  var idUsuario = req.body.Usuario_idUsuario;
  var periodoAnterior = numeroPeriodo - 1;

  Promise.join(operacion.getMaquinarias(idProducto,idProyecto,numeroPeriodo),operacion.getDemandaPotencial(numeroPeriodo,idProducto,idZona),
              operacion.getAlmacen(idProyecto,idProducto,periodoAnterior),operacion.getAlmacen(idProyecto,idProducto,numeroPeriodo),
              operacion.getOperacionProducto(idProyecto,idProducto,numeroPeriodo,idUsuario,idZona),
              function(maquinas,demanda,opAnterior,almacenActual,ventasTotales){

                var uniVendidasAnteriores = getVentasAnteriores(ventasTotales);

                var uniAlmacenadas = 0
                if(almacenActual.length != 0){
                  uniAlmacenadas = almacenActual[0].unidadesAlmacenadas;
                }

                var inventarioInicial = getInventarioInicial(opAnterior);
                console.log("Inventario Inicial",inventarioInicial);
                var produccionA = getProduccion(maquinas);
                var demandaP = demanda[0].cantidad;
                var uniProd = uniVendidas + uniAlmacenadas - inventarioInicial + uniVendidasAnteriores;

                if(uniProd > produccionA){
                  res.json({success:false,msg:"Maquinaria Insuficiente, reduce la cantidad a vender o compra más maquinaria",m:true});
                }
                else if(uniVendidas > demandaP){
                  res.json({success:false,msg:"Demanda Superada, reduce la cantidad a vender",m:false});
                }
                else{
                  res.json({success:true,msg:"Puedes vender"});
                }
  }).catch(function(err) {
    console.log(err);
    return res.json({success:false,msg:"Algo salio mal"});
  })
});

router.post('/productosventa', (req,res,next) => {
  var idU = req.body.idUsuario;
  var idP = req.body.idProyecto;
  var numeroPeriodo = req.body.numeroPeriodo;
  var numeroPeriodoAnterior = parseInt(numeroPeriodo) - 1;
  Promise.join(operacion.getOperaciones(idP,idU,numeroPeriodo),operacion.getAlmacenTotal(idP,numeroPeriodo),
              operacion.getAlmacenTotal(idP,numeroPeriodoAnterior),function(r1,r2,r3) {

    var r4 = r2.concat(r3);

    var hash = {};
    var array = r1.filter(function(current) {
      var exists = !hash[current.Producto_idProducto] || false;
      hash[current.Producto_idProducto] = true;
      return exists;
    });

    if(array.length == 0){
      var hash2 = {};
      var array2 = r4.filter(function(current) {
        var exists = !hash2[current.Producto_idProducto] || false;
        hash2[current.Producto_idProducto] = true;
        return exists;
      });
      return operacionesBien2(array2,numeroPeriodo);
    }
    else{
      return operacionesBien(r1,array);
    }
  }).then(function(arrglo){
    res.json({success:true,msg:"Bien",datos:arrglo});
  }).catch(function(err){
    console.log(err);
    res.json({success:false,msg:"Mal"});
  })
});

router.post('/equilibrio', (req,res,next) => {
  var idProyecto = req.body.idProyecto;
  var numeroPeriodo = req.body.numeroPeriodo;
  Promise.join(auxiliar.getEquilibrio(idProyecto,numeroPeriodo),auxiliar.getDepMaq(idProyecto,numeroPeriodo), function(r1,r2) {
    return equilibrioTotal(r1,r2);
  })
  .then(function(rows) {
    res.json({success:true,msg:"Bien",datos:rows});
  }).catch(function(err) {
    console.log(err);
    res.json({success:false,msg:"Mal"});
  });
});

router.post('/integrales', (req,res,next) => {
  var idProyecto = req.body.idProyecto;
  var numeroPeriodo = req.body.numeroPeriodo;
  Promise.join(operacion.getACV(idProyecto,numeroPeriodo),operacion.getBalances(idProyecto,numeroPeriodo),operacion.getAC(idProyecto,numeroPeriodo),operacion.getPedidos(idProyecto,numeroPeriodo),operacion.getPT(idProyecto,numeroPeriodo),
    function(axv,balances,ac,pedidos,pagos) {
    return getIntegral(axv,balances,ac,pedidos,pagos);
  }).then(function(rows) {
    res.json({success:true,msg:"Bien",datos:rows});
  }).catch(function(err) {
    console.log(err);
    res.json({success:false,msg:"Mal"});
  })
})

router.post('/tendencias', (req,res,next) => {
  var idProyecto = req.body.idProyecto;
  var numeroPeriodo = req.body.numeroPeriodo;
  Promise.join(operacion.getACV(idProyecto,numeroPeriodo),operacion.getBalances(idProyecto,numeroPeriodo),operacion.getAC(idProyecto,numeroPeriodo),operacion.getPedidos(idProyecto,numeroPeriodo),operacion.getPT(idProyecto,numeroPeriodo),
    function(axv,balances,ac,pedidos,pagos) {
    return getTendencia(axv,balances,ac,pedidos,pagos);
  }).then(function(rows) {
    res.json({success:true,msg:"Bien",datos:rows});
  }).catch(function(err) {
    console.log(err);
    res.json({success:false,msg:"Mal"});
  })
})

router.post('/selling', (req,res,next) => {
  var idProducto = req.body.Producto_idProducto;
  var idProyecto = req.body.Proyecto_idProyecto;
  var numeroPeriodo = req.body.numeroPeriodo;
  var uniVendidas = req.body.unidadesVendidas;
  var periodoAnterior = parseInt(numeroPeriodo) - 1;

  Promise.join(operacion.getProductoVendido(idProducto), auxiliar.getAuxiliarVenta(periodoAnterior,idProyecto,idProducto),
              operacion.getAlmacen(idProyecto,idProducto,numeroPeriodo),
              auxiliar.getAuxiliarVenta(numeroPeriodo,idProyecto,idProducto),operacion.getMaquinarias(idProducto,idProyecto,numeroPeriodo),
              variable.getIVA(),variable.getClientes(),variable.getProveedores(),
              function(producto,opAnterior,almacenActual,auxVenta,maquinas,iva,clientes,proveedores){
    //Variables
    var IVA = iva[0].valor
    var Proveedores = proveedores[0].valor;
    var Clientes = clientes[0].valor;
    //Se obtienen los datos necesarios
    var uniAlmacenadas = 0
    if(almacenActual.length != 0){
      uniAlmacenadas = almacenActual[0].unidadesAlmacenadas;
    }

    if(idProducto == 6){
      console.log(maquinas,"Maquinas");
    }
    //Depreciacion de maquinaria correspondiente
    var cTransMaq = getTM(maquinas);
    //CMPP
    var cUMP = producto[0].costosMPPUniProd;
    //Inventario Inicial
    var inventarioInicial = getInventarioInicial(opAnterior);
    //Efectivo del inventarioInicial
    var cashInventarioInicial = getCashInventarioInicial(opAnterior);
    //Ventas en efectivo
    var ventasCash = uniVendidas * producto[0].precioVenta;
    //IVA de las ventasz
    var ivaVentas = ventas = ventasCash * IVA;
    //Unidades a producir
    var uniProd = 0;
    if(uniVendidas != 0){
      uniProd = uniVendidas + uniAlmacenadas - inventarioInicial;
      if(uniProd <= 0){
          uniProd = 0.01;
      }

    }
    //Consumo de materias Primas
    var cMP = uniProd * producto[0].uniMP;
    //Consumo en efectivo --Materia Prima Cosumida de la tabla de Costo de Produccion y Ventas
    var cashMP = cMP * producto[0].costoUni;
    //IVA del consumo en efectivo
    var IVAMP = (cashMP * IVA)*(-1);
    //Costo de transformación unitario
    var cTransUnitario = 0;
    if(uniProd != 0){
      cTransUnitario = (producto[0].costosFijosFabri + cTransMaq + (uniProd * producto[0].costoVarUniFabri))/uniProd;
      console.log("Datos",idProducto,producto[0].costosFijosFabri,cTransMaq,uniProd,producto[0].costoVarUniFabri);
    }
    //Costo de transformacion Total
    var cTransTotal = (cTransUnitario * uniProd) - cTransMaq;
    //IVA de transformacion
    var IVATrans = 0;
    if(uniVendidas != 0){
      IVATrans = (cTransTotal * IVA)*(-1);
    }
    //Costo de Distribucion unitario
    var cDistribucionUnitario = 0;
    if(uniVendidas != 0){
      cDistribucionUnitario = (producto[0].gastosFijosDist/uniVendidas) + producto[0].costoVarUniDist;
    }
    //Costo de Distribucion Total
    var cDistribucionTotal = (cDistribucionUnitario*uniVendidas);
    //Costo de Distribucion despues de Depreciaciones
    var cDistribucionTotalDep = 0;
    if(uniVendidas != 0){
      cDistribucionTotalDep = cDistribucionTotal - producto[0].depDistribucion;
    }
    //IVA de Distribucion
    var IVADistribucion = (cDistribucionTotalDep * IVA)*(-1);
    //Costo de Administracion Total
    var cAdminTotal = 0;
    var cAdminTotalDep = 0;
    if(uniVendidas != 0){
      cAdminTotal = (producto[0].gastosFijosAdmon / uniVendidas)*uniVendidas;
      //Costo de Administracion despues de Depreciaciones
      cAdminTotalDep = cAdminTotal - producto[0].depAdmon;
    }
    //IVA de Administracion
    var IVAAdmin = (cAdminTotalDep * IVA)*(-1);
    //Costo de Produccion
    var cProduccion = cashMP + (cTransUnitario * uniProd);
    if(uniAlmacenadas > 0 && inventarioInicial > 0 && uniVendidas == 0){
      cProduccion = cTransMaq;
    }
    //Inventario Final de Articulo Terminado
    var inventarioFinal = 0;
    if(uniAlmacenadas > 0){
      if(inventarioInicial > 0 || uniVendidas > 0){
        inventarioFinal = ((cashInventarioInicial + cProduccion) / (inventarioInicial + uniProd)) * uniAlmacenadas;
      }
    }
    //Costo de ventas
    var cVentas = cProduccion + cashInventarioInicial - inventarioFinal;
    //Ganancia de ventas
    var ventas = ventasCash + ivaVentas;
    //Ventas por cobrar
    var ventasXCobrar = (ventas/360)*Clientes;
    //Ventas cobradas
    var ventasOff = ventas - ventasXCobrar;
    //Compras
    var compras = cashMP - IVAMP;
    //Compras por Pagar
    var comprasXPagar = (compras/360)*Proveedores;
    //Compras pagadas
    var comprasOff = compras - comprasXPagar;

    //Validación de 0's
    if(uniAlmacenadas == 0 && uniVendidas == 0 && cVentas == 0){
      ivaVentas = 0;
      IVAMP = 0;
      IVATrans = 0;
      IVADistribucion = 0;
      IVAAdmin = 0;
      ventas = 0;
      ventasXCobrar = 0;
      ventasOff = 0;
      compras = 0;
      comprasXPagar = 0;
      comprasOff = 0;
      cTransTotal = 0;
      cDistribucionTotal = 0;
      cAdminTotal = 0;
      cDistribucionTotalDep = 0;
      cAdminTotalDep = 0;
      cashMP = 0;
      cProduccion = 0;
      inventarioInicial = 0;
      inventarioFinal = 0;
      cVentas = 0;
      cTransMaq = 0;
    }

    //Damos de alta a la base
    if(auxVenta.length == 0){
        var x = {
          Producto_idProducto:idProducto,
          Balance_numeroPeriodo:numeroPeriodo,
          Proyectos_idProyecto:idProyecto,
          unidadesVendidas:uniVendidas,
          unidadesAlmacenadas:uniAlmacenadas,
          unidadesProducidas:uniProd,
          IVAxVentas:ivaVentas,
          IVACompras:IVAMP,
          IVATrans:IVATrans,
          IVADist:IVADistribucion,
          IVAAdmon:IVAAdmin,
        	Ventas:ventas,
          VentasPorCobrar:ventasXCobrar,
          VentasCobradas:ventasOff,
          Compras:compras,
          ComprasPorPagar:comprasXPagar,
          comprasPagadas:comprasOff,
          costoTransformacionVentas:cTransTotal,
          costoDistribucion:cDistribucionTotal,
          costoAdministrativo:cAdminTotal,
          costoDistDep:cDistribucionTotalDep,
          costoAdminDep:cAdminTotalDep,
          materiaCosumida:cashMP,
          costoDeProduccion:cProduccion,
          inventarioInicial:cashInventarioInicial,
          inventarioFinal:inventarioFinal,
          costoVentas:cVentas,
          costoTransformacionMaq:cTransMaq
        }
        console.log(x);
        auxiliar.AddAuxiliarVenta(x);
      }
      else{
        var y = {
          unidadesVendidas:uniVendidas,
          unidadesAlmacenadas:uniAlmacenadas,
          unidadesProducidas:uniProd,
          IVAxVentas:ivaVentas,
          IVACompras:IVAMP,
          IVATrans:IVATrans,
          IVADist:IVADistribucion,
          IVAAdmon:IVAAdmin,
        	Ventas:ventas,
          VentasPorCobrar:ventasXCobrar,
          VentasCobradas:ventasOff,
          Compras:compras,
          ComprasPorPagar:comprasXPagar,
          comprasPagadas:comprasOff,
          costoTransformacionVentas:cTransTotal,
          costoDistribucion:cDistribucionTotal,
          costoAdministrativo:cAdminTotal,
          costoDistDep:cDistribucionTotalDep,
          costoAdminDep:cAdminTotalDep,
          materiaCosumida:cashMP,
          costoDeProduccion:cProduccion,
          inventarioInicial:cashInventarioInicial,
          inventarioFinal:inventarioFinal,
          costoVentas:cVentas,
          costoTransformacionMaq:cTransMaq
        }
        console.log(y);
        auxiliar.setAuxiliarVenta(numeroPeriodo,idProyecto,idProducto,y);
      }
  }).then( function () {
    res.json({success:true, msg:"Operacion exitosa"});
  })
  .catch(function(err) {
    console.log(err);
    res.json({success: false, msg:"Operacion incompleta"});
  })
});
function getInventarioInicial(opAnterior){
  var i = 0;
  if(opAnterior.length != 0){
    i = opAnterior[0].unidadesAlmacenadas;
  }
  return i;
}

function getCashInventarioInicial(opAnterior){
  var i = 0;
  if(opAnterior.length != 0){
    i = opAnterior[0].inventarioFinal;
  }
  return i;
}

function getProductosV(rows){
  var r = [];
  for(let producto in rows){

  }
  return r;
}

function getTM(maquinas){
  var transM = 0;
  for (let key$ in maquinas) {
    transM += (maquinas[key$].costo * (maquinas[key$].depAcum/100))*maquinas[key$].Cantidad;
  }
  return transM;
}

function getProduccion(maquinas){
  var P = 0;
  for(let key$ in maquinas){
    P += (maquinas[key$].cantidadProd * maquinas[key$].Cantidad);
  }
  return P;
}

function operacionesBien(rows,array){
  if(rows.length == array.length){
    return array;
  }
  else{
    for(let key1 in array){
      for(let key2 in rows){
        if(array[key1].Producto_idProducto == rows[key2].Producto_idProducto){
          if(array[key1].Zona_idZonas != rows[key2].Zona_idZonas){
            array[key1].unidadesVendidas += rows[key2].unidadesVendidas;
          }
        }
      }
    }
    return array;
  }
}

function operacionesBien2(r1,np) {
  for(let i in r1){
    r1[i]['numeroPeriodo'] = np;
    r1[i]['unidadesVendidas'] = 0;
  }
  return r1;
}

function getVentasAnteriores(ventasTotales){
  var uniAnterioresVendidas = 0;
  for(let key in ventasTotales){
    uniAnterioresVendidas += ventasTotales[key].unidadesVendidas;
  }
  return uniAnterioresVendidas;
}

function jsonProductos(r1,r2,r3){
  var p = [];

  for(let key1 in r1){
    p.push(r1[key1].Producto_idProducto);
  }

  for(let key2 in r2){
    p.push(r2[key2].Producto_idProducto);
  }

  for(let key3 in r3){
    p.push(r3[key3].Maquinaria_idProducto);
  }

  var hash = {};

  var array = p.filter(function(current) {
    var exists = !hash[current] || false;
    hash[current] = true;
    return exists;
  });

  return array.sort(function(a,b){return a - b;});
}

function equilibrioTotal(rows,rows2) {
  var x = {MP:0,CFF:0,CFV:0,GDF:0,GDV:0,GAF:0,DEP:0,ventasTotales:0}
  var d1 = 0;
  var d2 = 0;
  var d3 = 0;
  for(let key in rows){
    d1 += (rows[key].costosMPPUniProd * rows[key].unidadesVendidas);
    d2 += rows[key].costoVarUniFabri * rows[key].unidadesVendidas;
    d3 += rows[key].costoVarUniDist * rows[key].unidadesVendidas;
    x.CFF += rows[key].costosFijosFabri;
    x.GDF += rows[key].gastosFijosDist;
    x.GAF += rows[key].gastosFijosAdmon;
    x.ventasTotales += (rows[key].VentasPorCobrar + rows[key].VentasCobradas - rows[key].IVAxVentas);
  }

  for(let key in rows2){
    x.DEP += (rows2[key].maqEquipo * .10);
  }

  x.MP = d1;
  x.CFV = d2;
  x.GDV = d3;

  return x;

}

function getIntegral(ventas,balances,cuentas,pedidos,pagos){
  var x = [];
  for(let key in balances){
    var y = {numeroPeriodo:0,ventasNetas:0,costoVentas:0,utilidadBruta:0,cDist:0,oGastos:0,cAdmin:0,utilidadOperacion:0,intereses:0,utilidadAntesImptos:0,ISR:0,PTU:0,utilidadEjercicio:0,pventasNetas:0,pcostoVentas:0,putilidadBruta:0,pcDist:0,poGastos:0,pcAdmin:0,putilidadOperacion:0,pintereses:0,putilidadAntesImptos:0,pISR:0,pPTU:0,putilidadEjercicio:0}
    y.numeroPeriodo = balances[key].numeroPeriodo;
    y.utilidadEjercicio = balances[key].utilidadEjercicio;
    y.ISR = balances[key].imptosPorPagar * 12;
    y.PTU = balances[key].PTUPorPagar;
    y.utilidadAntesImptos = y.utilidadEjercicio + y.ISR + y.PTU;
    for(let key5 in pagos){
      if(pagos[key5].numeroPeriodo == balances[key].numeroPeriodo){
        if(pagos[key5].tipo != 1){
        y.intereses += pagos[key5].intereses;
        }
      }
    }
    for(let key4 in pedidos){
      if(pedidos[key4].numeroPeriodo == balances[key].numeroPeriodo){
        y.intereses += pedidos[key4].anticipo;
      }
    }
    for(let key3 in cuentas){
      if(cuentas[key3].Balance_numeroPeriodo == balances[key].numeroPeriodo){
        y.oGastos += cuentas[key3].desarrolloMercado + cuentas[key3].desarrolloProducto;
      }
    }
    for(let key2 in ventas){
      if(ventas[key2].Balance_numeroPeriodo == balances[key].numeroPeriodo){
        y.ventasNetas += ventas[key2].Ventas - ventas[key2].IVAxVentas;
        y.cDist += ventas[key2].costoDistribucion;
        y.cAdmin += ventas[key2].costoAdministrativo;
      }
    }
    y.utilidadOperacion = y.utilidadAntesImptos + y.intereses;
    y.utilidadBruta = y.utilidadOperacion + y.oGastos + y.cDist + y.cAdmin;
    y.costoVentas = (y.utilidadBruta - y.ventasNetas) * -1;

    //Porcentajes
    y.pventasNetas = 100;
    y.pcostoVentas = getPorcentaje(y.costoVentas,y.ventasNetas);
    y.putilidadBruta = getPorcentaje(y.utilidadBruta,y.ventasNetas);
    y.pcDist = getPorcentaje(y.cDist,y.ventasNetas);
    y.poGastos = getPorcentaje(y.oGastos,y.ventasNetas);
    y.pcAdmin = getPorcentaje(y.cAdmin,y.ventasNetas);
    y.putilidadOperacion = getPorcentaje(y.utilidadOperacion,y.ventasNetas);
    y.pintereses = getPorcentaje(y.intereses,y.ventasNetas);
    y.putilidadAntesImptos = getPorcentaje(y.utilidadAntesImptos,y.ventasNetas);
    y.pISR = getPorcentaje(y.ISR,y.ventasNetas);
    y.pPTU = getPorcentaje(y.PTU,y.ventasNetas);
    y.putilidadEjercicio = getPorcentaje(y.utilidadEjercicio,y.ventasNetas);

    x.push(y);
  }
  return x;
}

function getTendencia(ventas,balances,cuentas,pedidos,pagos){
  var x = [];
  for(let key in balances){
    var y = {numeroPeriodo:0,efectivo:0,cuentasPCobrar:0,almacenPT:0,activoCirculante:0,activoFijo:0,pasivoCortoPlazo:0,pasivoTotal:0,capitalContable:0,ventasNetas:0,costoVentas:0,utilidadBruta:0,cDist:0,oGastos:0,cAdmin:0,totalGastos:0,utilidadNeta:0,pefectivo:0,pcuentasPCobrar:0,palmacenPT:0,pactivoCirculante:0,pactivoFijo:0,ppasivoCortoPlazo:0,ppasivoTotal:0,pcapitalContable:0,pventasNetas:0,pcostoVentas:0,putilidadBruta:0,pcDist:0,poGastos:0,pcAdmin:0,ptotalGastos:0,putilidadNeta:0}
    var ISR = PTU = intereses = utilidadAntesImptos = utilidadOperacion = 0;

    //Directo de balance
    y.numeroPeriodo = balances[key].numeroPeriodo;
    y.utilidadNeta = balances[key].utilidadEjercicio;
    y.efectivo = balances[key].cajaBancos;
    y.cuentasPCobrar = balances[key].cuentasPorCobrar;
    y.almacenPT = balances[key].almacenArtTerm
    y.activoCirculante = balances[key].cajaBancos + balances[key].almacenArtTerm + balances[key].cuentasPorCobrar;
    y.activoFijo = balances[key].terreno + balances[key].edifInsta + balances[key].maqEquipo + balances[key].mueblesEnseres + balances[key].eqTrans - balances[key].depEdif - balances[key].depMueblesEnseres - balances[key].depMaqEquipo - balances[key].depEqTrans;
    y.pasivoCortoPlazo = balances[key].IVAPorEnterar + balances[key].imptosPorPagar + balances[key].PTUPorPagar +balances[key].proveedores +balances[key].prestamosMenosAnio;
    y.pasivoTotal = balances[key].prestamosMasAnio + y.pasivoCortoPlazo;
    y.capitalContable = balances[key].utilidadEjercicio + balances[key].utilidadAcum + balances[key].capitalSocial + balances[key].reservaLegal;

    ISR = balances[key].imptosPorPagar * 12;
    PTU = balances[key].PTUPorPagar;
    utilidadAntesImptos = y.utilidadNeta + ISR + PTU;

    //Intereses
    for(let key5 in pagos){
      if(pagos[key5].numeroPeriodo == balances[key].numeroPeriodo){
        if(pagos[key5].tipo != 1){
        intereses += pagos[key5].intereses;
        }
      }
    }
    for(let key4 in pedidos){
      if(pedidos[key4].numeroPeriodo == balances[key].numeroPeriodo){
        intereses += pedidos[key4].anticipo;
      }
    }

    //Desarrollos
    for(let key3 in cuentas){
      if(cuentas[key3].Balance_numeroPeriodo == balances[key].numeroPeriodo){
        y.oGastos += cuentas[key3].desarrolloMercado + cuentas[key3].desarrolloProducto;
      }
    }

    //Datos de ventas
    for(let key2 in ventas){
      if(ventas[key2].Balance_numeroPeriodo == balances[key].numeroPeriodo){
        y.ventasNetas += ventas[key2].Ventas - ventas[key2].IVAxVentas;
        y.cDist += ventas[key2].costoDistribucion;
        y.cAdmin += ventas[key2].costoAdministrativo;
      }
    }

    //Calculos Finales
    utilidadOperacion = utilidadAntesImptos + intereses;
    y.utilidadBruta = utilidadOperacion + y.oGastos + y.cDist + y.cAdmin;
    y.costoVentas = (y.utilidadBruta - y.ventasNetas) * -1;
    y.totalGastos = y.oGastos + y.cDist + y.cAdmin;

    //Porcentajes
    if(balances[key].numeroPeriodo == 1){
      y.pefectivo = 100;
      y.pcuentasPCobrar = 100;
      y.palmacenPT = 100;
      y.pactivoCirculante = 100;
      y.pactivoFijo = 100;
      y.ppasivoCortoPlazo = 100;
      y.ppasivoTotal = 100;
      y.pcapitalContable = 100;
      y.pventasNetas = 100;
      y.pcostoVentas = 100;
      y.putilidadBruta = 100;
      y.pcDist = 100;
      y.poGastos = 100;
      y.pcAdmin = 100;
      y.ptotalGastos = 100;
      y.putilidadNeta = 100;
    }
    else{
      y.pefectivo = getPorcentaje(y.efectivo,x[0].efectivo);
      y.pcuentasPCobrar = getPorcentaje(y.cuentasPCobrar,x[0].cuentasPCobrar);
      y.palmacenPT = getPorcentaje(y.almacenPT,x[0].almacenPT);
      y.pactivoCirculante = getPorcentaje(y.activoCirculante,x[0].activoCirculante);
      y.pactivoFijo = getPorcentaje(y.activoFijo,x[0].activoFijo);
      y.ppasivoCortoPlazo = getPorcentaje(y.pasivoCortoPlazo,x[0].pasivoCortoPlazo);
      y.ppasivoTotal = getPorcentaje(y.pasivoTotal,x[0].pasivoTotal);
      y.pcapitalContable = getPorcentaje(y.capitalContable,x[0].capitalContable);
      y.pventasNetas = getPorcentaje(y.ventasNetas,x[0].ventasNetas);
      y.pcostoVentas = getPorcentaje(y.costoVentas,x[0].costoVentas);
      y.putilidadBruta = getPorcentaje(y.utilidadBruta,x[0].utilidadBruta);
      y.pcDist = getPorcentaje(y.cDist,x[0].cDist);
      y.poGastos = getPorcentaje(y.oGastos,x[0].oGastos);
      y.pcAdmin = getPorcentaje(y.cAdmin,x[0].cAdmin);
      y.ptotalGastos = getPorcentaje(y.totalGastos,x[0].totalGastos);
      y.putilidadNeta = getPorcentaje(y.utilidadNeta,x[0].utilidadNeta);
    }

    x.push(y);
  }
  return x;
}

function getPorcentaje(n1,n2) {
  var r = 0;
  if(n2 != 0){
    r = (n1/n2)*100;
  }
  return r;
}






module.exports = router;
