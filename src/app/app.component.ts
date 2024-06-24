import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Home', url: '/home', icon: 'map' },
    { title: 'Mantenimiento (Barrios)', url: '/barrios', icon: 'extension-puzzle' },
    { title: 'Listas de Tareas', url: '/listas', icon: 'list' },
    { title: 'Incidencias', url: '/incidencias', icon: 'warning' },
    { title: 'Alta Rotación', url: '/alta-rotacion', icon: 'trash' },
    { title: 'Soporte', url: '/soporte', icon: 'cog' },
  ];
  constructor() {}
}
