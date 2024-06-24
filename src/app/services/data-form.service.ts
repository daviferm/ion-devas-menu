import { HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { from } from 'rxjs';
import { AltaRotacion, Parquimetro } from '../interfaces/markers.interface';
// import { StorageService } from './storage.service';
import { ajax } from 'rxjs/ajax';


@Injectable({
  providedIn: 'root'
})
export class DataFormService {

  enviarPageHome: EventEmitter<Parquimetro> = new EventEmitter();
  enviarPageBarrios: EventEmitter<Parquimetro[]> = new EventEmitter();
  enviarPageTareas: EventEmitter<Parquimetro> = new EventEmitter();
  enviarPageIncidencias: EventEmitter<Parquimetro> = new EventEmitter();
  enviarPageSoporte: EventEmitter<Parquimetro> = new EventEmitter();


  selector: any;
  input: any;
  urlDataLocal = '../../assets/data/data.json';
  urlDataFS = 'https://app-devas.firebaseio.com/parkimetros.json';
  urlElemFS = 'https://app-devas.firebaseio.com/parkimetros/';

  public DB: Parquimetro[] = [];
  barrio: any = [];
  http: any;

  constructor(  ) {

    this.getFirebase();

  }


  getParkimetro(barrio: string, numero?: any): Parquimetro | null {

    if (numero.length === 3) { numero = '0' + numero; }
    if (numero.length === 2) { numero = '00' + numero; }
    if (numero.length === 1) { numero = '000' + numero; }

    for(const [key, value] of Object.entries(this.DB)){
      if ( value.alias.endsWith(numero) && value.barrio.startsWith(barrio) ) {
        return value;
      }
    }

    return null;

  }

  obtenerBarrrio(barrio: string) {

    this.barrio = this.DB.filter( elem => elem.barrio.startsWith( barrio ) && elem.estado !== 'desmontada');
    this.barrio.forEach((item: Parquimetro) => {
      item.latitud = Number( item.latitud );
      item.longitud = Number( item.longitud );
      item.idx = '';
    });

    return this.barrio;
  }
  obtenerNumeroParkimetros(numero: string) {

    const barrio = this.DB.filter( elem => elem.barrio.startsWith( numero ) && elem.estado !== 'desmontada'  );

    return barrio.length;
  }

  // Obtener arreglo con todos los parquímetros y los guarda en Firebase
  getFirebase() {

    const data = from( fetch(this.urlDataFS) );

    data.subscribe( async(resp) => {
      this.DB = await resp.json();
    } )
  }

  // Base de datos local de parquímetros
  getParkimetrosLocal() {

    const data = from( fetch(this.urlDataLocal) );

    return data.subscribe( async (resp) => {

      const dataLocal = await resp.json();
      // tslint:disable-next-line: forin
      for ( const clave in dataLocal.parkimetros ) {
        this.DB.push(dataLocal.parkimetros[clave]);
      }
    } );
  }
   // Actualizar un parquimetro desde el formulario
   actualizarPark( park: Parquimetro ) {
    const body = JSON.stringify( park );

    const idx = this.DB.findIndex( elem => elem.alias === park.alias);


    const url = `${this.urlElemFS}${idx}.json`;

    const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

    return ajax.put( url, body );

  }
  // Añade un elemento Parquimetro a la Firebase
  nuevoRegistro( elem: Parquimetro ) {

    const body = JSON.stringify( elem );

    return ajax.post( this.urlDataFS, body );

  }

  // =========================================================
  // Enviar registro (parquímetro) a la página que lo solicite
  // =========================================================
  sendRegister(item: Parquimetro, page: string) {

    if ( page === 'home' ) {
      // Enviar a home
      this.enviarPageHome.emit(item);
    } else if ( page === 'listas' ) {
      // Enviar a Listas de Tareas
      this.enviarPageTareas.emit(item)
    } else if ( page === 'soporte' ) {
      // Enviar a Soporte
      this.enviarPageSoporte.emit(item);
    } else if ( page === 'incidencias' ) {
      // Enviar a Incidencias
      this.enviarPageIncidencias.emit(item);
    }
  }

  // ===========================================================
  // Función para enviar barrio seleccionado a la página Barrios
  // ===========================================================
  sendArrayBarrio( items: Parquimetro[] ) {
    this.enviarPageBarrios.emit( items )
  }


  obtenerItemsAltaRotacion(): any {

    if ( this.DB.length !== 0 ) {

      const items = this.DB.filter( elem => elem.tarifa === 'AR' );
      // items.forEach( item => item.id = '' );
      const itemsSort = this.ordenarItems( items );
      let barriosAr = this.obtenerBarriosAltaRotacion( itemsSort );
      localStorage.setItem( 'itemsAR', JSON.stringify( itemsSort ) );

      return barriosAr;

    }

  }
  obtenerBarriosAltaRotacion( items: Parquimetro[] ) {

    let barrios: string[] = [];
    let barriosSort: any = [];

    items.forEach( el => {
        barrios.push( el.barrio );
    } )

    const setBarrios = new Set( barrios );

    setBarrios.forEach( barrio => {
        barriosSort.push( {
            barrio: barrio,
            items: items.filter( elem => elem.barrio === barrio )
        } )
    } );
    localStorage.setItem( 'barriosAR', JSON.stringify( barriosSort ) );

    return setBarrios;

  }

  // Ordenar Items por número de barrio
  ordenarItems(items: Parquimetro[]) {
    items.sort(function ( a , b) {
      if (a.barrio > b.barrio) {
        return 1;
      }
      if (a.barrio < b.barrio) {
        return -1;
      }
      // a es igual que b
      return 0;
    });

    return items;
  }


}
