import { Injectable } from '@angular/core';
import {maquinaria} from '../app.interfaces';
import {Http, Headers} from '@angular/http';
import {MaquinariaService} from './maquinaria.service';
import {BalanceService} from './balance.service';
import 'rxjs/Rx';

@Injectable()
export class CompraMaquinariaService {
  maqCompradas:any[]=new Array();
  maquinas:maquinaria[]=new Array();
  maquinasCompradas:any[]=[];
  balanceTemporal:any;



  constructor(private _maquinariaService:MaquinariaService,
              private _balanceService:BalanceService,
              private http:Http) {
   }

   establecerValores(){
     this.maquinasCompradas.length = 0;
     this.getMaquinariaC().subscribe( data => {
       for(let key$ in data.datos){
           this.maquinasCompradas.push(data.datos[key$]);
       }
     });
     return this.maquinasCompradas;
   }

   returnMaquinasCompradas(){
     return this.establecerValores();
   }


   getMaquinariaC(){
     let headers = new Headers({
       'Content-Type':'application/json'
     });
     var x = {
       idProyecto:localStorage.getItem('idProyecto'),
       numeroPeriodo:localStorage.getItem('numeroPeriodo')
     }
    return this.http.post('maquinariacomprada/',x,{headers}).map(res => res.json());
   }

  compraMaquinaria(x,y){
    this.cobrar(y).subscribe( data => {
      console.log("Perro",data)
    });
    var maqC = [];
    this.comprar(x).subscribe(data => {
      for(let key$ in data.datos){
        maqC.push(data.datos[key$]);
      }
    });
    return maqC;
  }

  regresarMaquinaria(x,y){
    this.undo(y).subscribe(data => {
      console.log("Undo",data)
    });
    var maqC = [];
    this.vuelta(x).subscribe(data => {
      console.log("Vuelta",data)
      for(let key$ in data.datos){
        maqC.push(data.datos[key$]);
      }
    });
    return maqC;
  }

  cobrar(x){
    let headers = new Headers({
      'Content-Type':'application/json'
    });
    return this.http.post('maquinariacomprada/cobrar/', x, {headers}).map( res => res.json());
  }

  comprar(x){
    let headers = new Headers({
      'Content-Type':'application/json'
    });
    return this.http.post('maquinariacomprada/compra/', x, {headers}).map( res => res.json());
  }

  asingar(x){
    let headers = new Headers({
      'Content-Type':'application/json'
    });
    console.log(x)
    return this.http.post('maquinariacomprada/asignar/', x, {headers}).map( res => res.json());
  }

  vuelta(x){
    let headers = new Headers({
      'Content-Type':'application/json'
    });
    return this.http.post('maquinariacomprada/vuelta/', x, {headers}).map( res => res.json());
  }

  undo(x){
    let headers = new Headers({
      'Content-Type':'application/json'
    });
    return this.http.post('maquinariacomprada/undo/', x, {headers}).map( res => res.json());
  }
}
