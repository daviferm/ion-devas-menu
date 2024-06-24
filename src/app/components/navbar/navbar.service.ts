import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {

   // Evento para mostrar u ocultar en bavbar
   mostrarOcultarNavbar: EventEmitter<boolean> = new EventEmitter();
   // Evento para saber si estamos dentro de una lista de tareas
   listaTarea: EventEmitter<boolean> = new EventEmitter();


    // Evento para mostrar u ocultar en bavbar al cambiar de página
    navbarOutIn: EventEmitter<boolean> = new EventEmitter();

  constructor() { }
}
