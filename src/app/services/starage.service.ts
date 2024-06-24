import { Injectable, EventEmitter } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ListaInteface } from '../interfaces/markers.interface';

// paginaActiva => Página en primer plano
// lista-tareas => Listas de tareas
// maps-barrios => Lista de mapas de barrios
// lista-incidencias => Lista de incidencias

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  actualizarStorage: EventEmitter<string> = new EventEmitter();
  listTareas: ListaInteface[] = [];
  public pageActive!: string;

  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Método para insertar un registro en Storage
  public async setStorage(key: string, value: any) {
    this._storage?.set(key, value);
  }

  // Método para acceder a un registro del Storage
  public getStorage(key: string): Promise<any> {
    return this._storage!.get( key );
  }


  // =================================================
  // Local Storage
  // =================================================
  setLocalStorage( key: string, value: string ) {
    // Guardamos la lista de tareas en localStorage
    localStorage.setItem( key, value);
  }

  public getLocalStorage( key: any ) {
    return localStorage.getItem( key );
  }

}
