import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { NavbarService } from 'src/app/components/navbar/navbar.service';
import { IncidenciaInteface } from 'src/app/interfaces/markers.interface';
import { DataFormService } from 'src/app/services/data-form.service';
import { GestionRutasService } from 'src/app/services/gestion-rutas.service';
import { Parquimetro } from '../../interfaces/markers.interface';
import { StorageService } from 'src/app/services/starage.service';
import { MapItemsComponent } from 'src/app/components/map-items/map-items.component';
import { ModalInfoComponent } from 'src/app/components/modal-info/modal-info.component';


@Component({
  selector: 'app-incidencias',
  templateUrl: './incidencias.page.html',
  styleUrls: ['./incidencias.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, NavbarComponent, MapItemsComponent, ModalInfoComponent]
})
export class IncidenciasPage implements OnInit {

  listIncidencias: IncidenciaInteface[] = [];
  reorderDisable: boolean = true;
  tareas: boolean = false;
  mapSearch: boolean = false;
  centerLat!: number;
  centerLng!: number;
  centroMap!: { lat: number, lng: number };
  zoomMap!: number;
  openModal: boolean = false;

  constructor( private storage: StorageService,
               private navbarService: NavbarService,
               public alertController: AlertController,
               public toastController: ToastController,
               private dataService: DataFormService,
               public modalController: ModalController,
               private gestionRutasService: GestionRutasService ) {

    this.actualizarIncidenciasStorge();
    this.gestionRutasService.pageActive = 'incidencias';
  }

  ngOnInit() {
    this.dataService.enviarPageIncidencias.subscribe( resp  => {
      if ( resp ) {
        this.presentAlertIncidencia( resp );
      }
    })
  }

  // =================================================
  // Mostrar mapa con todos los parquímetros de la lista
  // =================================================
  mostrarMapa(): void {
    if ( this.listIncidencias.length > 0 ) {
      this.navbarService.mostrarOcultarNavbar.emit( false );
      this.mapSearch = true;
      this.gestionRutasService.incidenciasPage = true;
      this.centroMap = { lat: Number(this.listIncidencias[0].item.latitud), lng: Number(this.listIncidencias[0].item.longitud) };
      this.zoomMap = 12;
      setTimeout( () => {
        this.zoomMap = 13;
      }, 200)
    }
  }
  // =================================================
  // Cerrar mapa
  // =================================================
  cerrandoMapa( event: boolean ) {
    if ( event ) {
      this.navbarService.mostrarOcultarNavbar.emit( true );
      this.mapSearch = false;
      this.gestionRutasService.incidenciasPage = false;
    }
  }
  // =================================================
  // Alert para introducir el título de la tarea
  // =================================================
  async presentAlertIncidencia( element: Parquimetro ) {
    const alert = await this.alertController.create({
      header: 'Nueva tarea',
      message: 'Introduce un nombre para la tarea.',
      translucent: true,
      inputs: [
      {
        name: 'titulo',
        type: 'text',
        min: 3,
        max: 15,
        attributes: {
          autoComplete: 'off',
          autoFocus: true
        },
        placeholder: 'Escribe un título',
        handler: () => {
         console.log('Input tarea...');
        }
      },
      ],
      buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
         console.log('Cancelar...');
        }
      }, {
        text: 'Ok',
        handler: (input) => {

          if ( input.titulo.length > 1 ) {

            const incidencia: IncidenciaInteface = {
              localId: new Date().getTime(),
              titulo: input.titulo,
              item: element
            }
            this.guardarIncidencia( input.titulo, element );

          } else {
            this.presentToastWithOptions('El título debe tener mas de 1 caracter.');
          }


        }
      }
      ]
    });
    await alert.present();
  }
  // =================================================
  // Mensaje Toast en la parte superior
  // =================================================
  async presentToastWithOptions(mensage: string) {
    const toast = await this.toastController.create({
      message: mensage,
      position: 'bottom',
      duration: 2000,
      cssClass: 'mytoast',
      buttons: [
        {
          side: 'start',
          icon: 'map-outline',
        }, {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked');
          }
        }
      ]
    });
    await toast.present();
  }

  guardarIncidencia(titulo: string, element: Parquimetro) {
    if ( !this.listIncidencias ) {
      this.listIncidencias = [];
    }
    const id = new Date().getTime();
    element.id = id;
    element.latitud = Number(element.latitud);
    element.longitud = Number(element.longitud);
    const newtarea: IncidenciaInteface = {
      localId: id,
      titulo: titulo,
      item: element
    }
    this.listIncidencias.push( newtarea );
    this.storage.setLocalStorage('lista-incidencias', JSON.stringify(this.listIncidencias));
  }

  actualizarIncidenciasStorge() {
    this.listIncidencias = (JSON.parse(this.storage.getLocalStorage('lista-incidencias')!)) ? JSON.parse(this.storage.getLocalStorage('lista-incidencias')!) : [];
    // this.listIncidencias = JSON.parse(this.storage.getLocalStorage('lista-incidencias')!);
  }

  borrarIncidencia( idx: number ) {
    this.listIncidencias.splice( idx, 1 );
    this.storage.setLocalStorage('lista-incidencias', JSON.stringify(this.listIncidencias));
  }
  doReorder(event: any) {
    this.listIncidencias = event.detail.complete( this.listIncidencias );
    this.storage.setLocalStorage('lista-incidencias', JSON.stringify(this.listIncidencias));
  }

  openModalInfo() {
    this.openModal = true;
  }

  closeModalInfo(event: boolean) {
    this.openModal = false;
  }

}
