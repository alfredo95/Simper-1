import { Component, OnInit, ViewChild } from '@angular/core';
import {ZonasService} from '../../../../services/zonas.service';
import {ProductoService} from '../../../../services/producto.service';
import {DesarrolloZonaService} from '../../../../services/desarrollo-zona.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {producto} from '../../../../app.interfaces';
import { ModalDirective } from 'ngx-bootstrap/modal';
import {ProyectosService} from '../../../../services/proyectos.service';



@Component({
  selector: 'app-desarrollo-mercado',
  templateUrl: './desarrollo-mercado.component.html',
  styleUrls: ['./desarrollo-mercado.component.css']
})
export class DesarrolloMercadoComponent implements OnInit {

  @ViewChild('modalConfDes') public modalConfDes:ModalDirective;
  @ViewChild('modalConfPago') public modalConfPago:ModalDirective;


  zonas=[]
  productos:producto[]=[];
  productosZonaSinDesarrollar:any[] = [];
  productosZonaEnDesarrollo: any[] = [];
  productosZonaDesarrollados: any[] = [];
  zonaForm:FormGroup;
  productoSelectedAdd:any;
  productoSelectedPago:any;
  openConf:boolean=false;
  openPago:boolean=false;
  openLoad:boolean=false;
  openLoadRegresa:boolean=false;


  constructor(private _zonasService: ZonasService,
              private _desarrolloZonaService:DesarrolloZonaService,
              private _productoService:ProductoService,
            private _proyectoService:ProyectosService) {
this._proyectoService.ocultaCierrePeriodo()
    this.zonas=this._zonasService.returnZonasNormales();
    this.productos=this._productoService.returnProductos();
    this.productosZonaSinDesarrollar = this._desarrolloZonaService.returnProductosDeZonaSinDesarrollar();
    this.productosZonaEnDesarrollo = this._desarrolloZonaService.returnProductosDeZonaEnDesarrollo();
    this.productosZonaDesarrollados = this._desarrolloZonaService.returnProductosDeZonaDesarrollados();
    this.productoSelectedAdd={
      idZona:null,
      idProducto:null,
      nombreZona:null
    }

    this.productoSelectedPago={
      idZona:null,
      idProducto:null,
      nombreZona:null
    }
    setTimeout(() => {
     this.productoSelectedAdd={
       idZona:this.productosZonaSinDesarrollar[0].idZona,
       idProducto:this.productosZonaSinDesarrollar[0].productosSinDes[0]
     }

   }, 400);

    console.log(this.productosZonaSinDesarrollar)
    console.log(this.productosZonaEnDesarrollo)
    console.log(this.productosZonaDesarrollados)
    this.zonaForm=new FormGroup({
      'idProducto':new FormControl('',Validators.required)
    });
   }

  ngOnInit() {
  }

  selecciona(producto,idZona){
    if(producto==this.productoSelectedAdd.idProducto && idZona==this.productoSelectedAdd.idZona)
      return true
    else
      return false
  }

  getNameById(id:number){
    for(let producto of this.productos){
      if(producto.idProducto==id)
       return producto.nombreProd;
    }
    return "id no encontrado";

  }


  validaPago(producto){
    console.log("Perro",producto);
    if(producto==localStorage.getItem('numeroPeriodo')){
      return true
    }
    else{
      return false
    }
  }



  getCosto(idZona,idProducto){
    for(let zona of this.zonas){
      if(zona.idZona == idZona){
        for(let producto of zona.productos){
          if(producto.Producto_idProducto == idProducto){
            return producto.costoDes;
          }
        }
      }
    }
    return 0;
  }

  getTiempo(idZona,idProducto){
    for(let zona of this.zonas){
      if(zona.idZona == idZona){
        for(let producto of zona.productos){
          if(producto.Producto_idProducto == idProducto){
            return producto.tiempoDes;
          }
        }
      }
    }
    return 0;
  }

  pagarDesarrollo(){
    this.openPago=false;
    this.openLoad=true;

    var costo = this.getCosto(this.productoSelectedPago.idZona,this.productoSelectedPago.idProducto);
    var x = {
      Producto_idProducto:this.productoSelectedPago.idProducto,
      Zona_idZonas:this.productoSelectedPago.idZona,
      Proyecto_idProyecto:localStorage.getItem('idProyecto'),
      Proyecto_Usuario_idUsuario:localStorage.getItem('idUsuario'),
      numeroPeriodo:localStorage.getItem('numeroPeriodo')
    }
    this._desarrolloZonaService.Desarrollar(x).subscribe();
    this._desarrolloZonaService.cobrarDesarrollo(costo,this.productoSelectedPago.idProducto).subscribe();

    setTimeout(()=>{
      this.openLoad=false;
      this.actualizar();
    },2000);

  }

  deshacer(idZona, idProducto){
    var x = {
      idZona:idZona,
      idProducto:idProducto,
      costoDes: this.getCosto(idZona,idProducto)
    }

    var z = this._desarrolloZonaService.undoTotal(x);
    this.openLoadRegresa=true;
    setTimeout(()=>{
      this.openLoadRegresa=false;
      if(z){
        this.actualizar();
      }
    }, 1000);
  }

  desarrollaZona(producto){
    this.openConf=false;
    this.openLoad=true;
    var x = {
      Producto_idProducto:producto.idProducto,
      Zona_idZonas:producto.idZona,
      Proyecto_idProyecto:localStorage.getItem('idProyecto'),
      Proyecto_Usuario_idUsuario:localStorage.getItem('idUsuario'),
      periodoInicio:localStorage.getItem('numeroPeriodo'),
      numeroPeriodo:localStorage.getItem('numeroPeriodo')
    }
    var costo = this.getCosto(producto.idZona,producto.idProducto);
    this._desarrolloZonaService.cobrarDesarrollo(costo,producto.idProducto).subscribe();
    this._desarrolloZonaService.comenzarDesarrolloZona(x);

    setTimeout(()=>{
      this.openLoad=false;
      this.actualizar();
    },2000);
  }

  quitaProducto(zona,producto){
    for(let i in this.productosZonaSinDesarrollar){
      if(this.productosZonaSinDesarrollar[i].idZona==zona)
        for(let j in this.productosZonaSinDesarrollar[i].productosSinDes){
          if(this.productosZonaSinDesarrollar[i].productosSinDes[j]==producto){
            this.productosZonaSinDesarrollar[i].productosSinDes.splice(parseInt(j),1);
          }
        }
    }
  }

  confPagoF(idZona,idProducto,nombreZona){
    this.openPago=true;
    this.productoSelectedPago={
      idZona:idZona,
      idProducto:idProducto,
      nombreZona:nombreZona
    };
    console.log(this.productoSelectedPago)
  }


  selectProductoAdd(idProducto,idZona,nombreZona){

    this.productoSelectedAdd={
      idProducto:idProducto,
      idZona:idZona,
      nombreZona:nombreZona
    };
      console.log(this.productoSelectedAdd);
  }

  actualizar(){
    this.productosZonaSinDesarrollar = this._desarrolloZonaService.returnProductosDeZonaSinDesarrollar();
    this.productosZonaEnDesarrollo = this._desarrolloZonaService.returnProductosDeZonaEnDesarrollo();
  }

  validaVi(){
    if(localStorage.getItem('numeroPeriodo')==localStorage.getItem('numeroRPeriodos')&& !parseInt(localStorage.getItem('terminado')))
      return false
    else
      return true
  }

}
