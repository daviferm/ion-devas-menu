import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GestionRutasService {

  getLocation: EventEmitter<boolean> = new EventEmitter();

  public pageActive: string;
  public searchPage: boolean = false;
  public listasPage: boolean = false;
  public incidenciasPage: boolean = false;
  public barriosPage: boolean = false;
  public soportePage: boolean = false;

  constructor() {
    this.pageActive = 'search';
   }
}
