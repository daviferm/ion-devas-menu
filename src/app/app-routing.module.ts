import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then( m => m.HomePage)
  },
  {
    path: 'alta-rotacion',
    loadComponent: () => import('./pages/alta-rotacion/alta-rotacion.page').then( m => m.AltaRotacionPage)
  },
  {
    path: 'barrios',
    loadComponent: () => import('./pages/barrios/barrios.page').then( m => m.BarriosPage)
  },
  {
    path: 'listas',
    loadComponent: () => import('./pages/listas/listas.page').then( m => m.ListasPage)
  },
  {
    path: 'incidencias',
    loadComponent: () => import('./pages/incidencias/incidencias.page').then( m => m.IncidenciasPage)
  },
  {
    path: 'soporte',
    loadComponent: () => import('./pages/soporte/soporte.page').then( m => m.SoportePage)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
