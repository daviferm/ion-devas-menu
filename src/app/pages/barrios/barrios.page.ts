import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { IonList, AlertController, ToastController, IonicModule, IonItemSliding } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { BarrioInterface, Parquimetro } from 'src/app/interfaces/markers.interface';
import { DataFormService } from '../../services/data-form.service';
import { LayerBarrio } from '../../interfaces/markers.interface';
import { MapPolygonService } from '../../services/map-polygon.service';
import { NavbarService } from 'src/app/components/navbar/navbar.service';
import { StorageService } from '../../services/starage.service';
import { GestionRutasService } from 'src/app/services/gestion-rutas.service';
import { ModalInfoComponent } from 'src/app/components/modal-info/modal-info.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { FormsModule } from '@angular/forms';
import { MapItemsComponent } from 'src/app/components/map-items/map-items.component';



@Component({
  selector: 'app-barrios',
  templateUrl: './barrios.page.html',
  styleUrls: ['./barrios.page.scss'],
  standalone: true,
  imports: [IonicModule,
            CommonModule,
            FormsModule,
            NavbarComponent,
            ModalInfoComponent,
            HeaderComponent,
            MapItemsComponent,
            PipesModule]
})
export class BarriosPage implements OnInit {

  public alertController = inject( AlertController );
  public toastController = inject( ToastController );
  private dataFormService = inject( DataFormService );
  private storageService = inject( StorageService );
  private polygonService = inject( MapPolygonService );
  private navbarService = inject( NavbarService );
  private gestionRutasService = inject( GestionRutasService );

  itenSlider!: IonItemSliding;

  @ViewChild(IonList) lista!: IonList;
  centroMap!: {lat: number, lng: number};
  zoomMap!: number;
  barriosSelec: LayerBarrio[] = [];
  tareasBarrios: BarrioInterface[] = [];
  mapaNuevo!: Parquimetro[];
  tareas: boolean = true;
  reorderDisable: boolean = false;
  // Variable para mostrar el mapa con los parquímetros de la lista
  mapSearch: boolean = false;
  tareaActiva!: BarrioInterface | null;
  paginaActiva: string = 'listas';
  marcadores!: Parquimetro[];
  centerLat!: number;
  centerLng!: number;
  slideOpts = {
    initialSlide: 0,
    allowTouchMove: false,
    speed: 400
  };
  openModal: boolean = false;
  registroObs!: Subscription;
  directionSlider!: number;
  tareaIdx!: number | undefined;
  itemsMapas: boolean = true;

  slideIndex: number = 0;

  constructor() {
    this.actualizarTareasStorage();
    this.gestionRutasService.pageActive = 'barrios';
  }

  ngOnInit() {
    this.dataFormService.enviarPageBarrios.subscribe( resp => {
      if ( resp ) {
        this.mapaNuevo = this.ordenarItems( resp );
        this.presentAlertNuevoMapa();
      }
    } )
  }

  doReorder(event: any) {
    this.tareasBarrios = event.detail.complete(this.tareasBarrios);

    this.storageService.setLocalStorage('maps-barrios', JSON.stringify(this.tareasBarrios));
  }

  // =================================================
  // Ordenar mapa
  // =================================================
  ordenarItems( items: Parquimetro[] ) {
    items.sort(function (a, b) {
      if ( a.alias > b.alias ) {
        return 1;
      }
      if ( a.alias < b.alias ) {
        return -1;
      }
      // a es igual que b
      return 0;
    });

    return items;
  }

   // =================================================
  // Alert para introducir el título de la tarea
  // =================================================
  async presentAlertNuevoMapa() {
    const alert = await this.alertController.create({
      header: 'Nuevo mapa',
      message: 'Introduce un nombre para la tarea.',
      inputs: [
      {
        name: 'titulo',
        type: 'text',
        min: 3,
        max: 15,
        attributes: {
          autoComplete: 'off'
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

            this.guardarNuevoMapa( input.titulo );

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

  guardarNuevoMapa(titulo: string) {
    this.mapaNuevo.forEach( m => m.hecho = false );
    const nuevoMapa = {
      localId: new Date().getTime(),
      barrio: this.mapaNuevo[0].barrio,
      titulo: titulo,
      hecho: false,
      items: this.mapaNuevo
    }
    console.log(nuevoMapa);
    this.tareasBarrios.push( nuevoMapa );
    this.storageService.setLocalStorage( 'maps-barrios',  JSON.stringify(this.tareasBarrios) );
  }

  borrarMapa( slider: any, idx: number ) {

    if ( this.directionSlider < 0 ) {
      this.tareasBarrios.splice(idx,1);
      this.storageService.setLocalStorage( 'maps-barrios', JSON.stringify(this.tareasBarrios) );
    } else {
      console.log('No borrar Item');
    }
    slider.close()
  }

  onItemDragSlider( e: any, idx: number, slider: IonItemSliding ) {
    this.itenSlider = slider;
    this.directionSlider = e.detail.amount;
    if ( e.detail.ratio == 1 ) {
      this.tareaActiva = this.tareasBarrios[idx];
    }
  }

  actualizarTareasStorage() {

    if ( this.storageService.getLocalStorage('maps-barrios') ) {
      this.tareasBarrios = JSON.parse(this.storageService.getLocalStorage('maps-barrios')!);
    } else {
      this.tareasBarrios = [];
    }
  }

  itemOk( slider: any, idx: number ) {
    slider.close();

    if ( !this.tareaActiva!.items[idx].hecho ) {
      this.tareaActiva!.items[idx].hecho = true;
      this.tareaActiva!.items[idx].opacidad = 0.5;
    } else {
      this.tareaActiva!.items[idx].hecho = false;
      this.tareaActiva!.items[idx].opacidad = 1;
    }
  }
  ionChangeCheck( marker: Parquimetro ) {
    marker.opacidad = marker.hecho ? 0.5 : 1;
  }
  //===============================================
  // Mostrar u oculcat Modal de Información
  //===============================================
  openModalInfo() {
    this.openModal = true;
  }

  closeModalInfo(event: boolean) {
    this.openModal = false;
  }

  // Mostrar mapa con los items
  mostrarMapa( slider?: any, idx?: number ) {
    if ( slider ) {
      slider.close();
    }
    if ( this.itenSlider ) {
      this.itenSlider.close();
    }
    this.barriosSelec = [];
    this.zoomMap = 12;

    if ( this.tareaIdx != undefined ) {
      this.tareaActiva = this.tareasBarrios[this.tareaIdx];

    } else {
      this.tareaActiva = this.tareasBarrios[idx!];
      if ( idx ) {
        this.tareaActiva = this.tareasBarrios[idx];
      }
    }
    const numBarrio = this.tareaActiva!.barrio.slice(0,3);
    this.centroMap = this.optenerCentro( Number(numBarrio) );
    const areaBarrio = this.polygonService.getBarrio( this.tareaActiva!.barrio.slice(0,3 ));
    this.barriosSelec.push( areaBarrio! );
    this.mapSearch = true;
    this.navbarService.mostrarOcultarNavbar.emit( false );
    setTimeout( () => {
      this.zoomMap = 15;
    }, 100 );
  }

  mostrarLista( slider: any, idx: number ) {

    this.tareaActiva = this.tareasBarrios[idx];
    this.itemsMapas = false;
    // this.myNavSub.slideNext();
    this.tareas = false;
    this.tareaIdx = idx;
    slider.close();
  }

   // Volver a lista de mapas
   mostrarTareas() {
    this.tareaIdx = undefined;
    this.storageService.setLocalStorage( 'maps-barrios', JSON.stringify(this.tareasBarrios) );

    // this.myNavSub.slidePrev();
    this.itemsMapas = true;
    this.tareas = true;
    this.tareaActiva = null;
  }

  // Evento para saber cuando termita el evenots de volver al Slide prencipal
  ionSlidePrevEnd() {
    this.tareaActiva = null;
  }

  cerrandoMapa(event: any) {
    this.storageService.setLocalStorage('maps-barrios', JSON.stringify(this.tareasBarrios));
    if ( event ) {
      this.mapSearch = false;
      this.tareaActiva = ( !this.tareas ) ? this.tareaActiva : null;
      this.navbarService.mostrarOcultarNavbar.emit( true );
    }
  }


  // Optener cetro del mapa según el barrio
  optenerCentro(barrio: number) {
    const numBarrio = barrio;
    let centro;
    switch (numBarrio) {
        case 44:
            centro = { lat: 40.436347, lng: -3.667389 };
            break;
        case 45:
            centro = { lat: 40.432375, lng: -3.676183 };
            break;
        case 46:
            centro = { lat: 40.433368, lng: -3.683588 };
            break;
        case 51:
            centro = { lat: 40.445408, lng: -3.684342 };
            break;
        case 52:
            centro = { lat: 40.443262, lng: -3.669103 };
            break;
        case 53:
            centro = { lat: 40.448204, lng: -3.67265 };
            break;
        case 54:
            centro = { lat: 40.455497, lng: -3.677462 };
            break;
        case 55:
            centro = { lat: 40.461893, lng: -3.679066 };
            break;
        case 56:
            centro = { lat: 40.472714, lng: -3.677789 };
            break;
        case 61:
            centro = { lat: 40.451753, lng: -3.707646 };
            break;
        case 62:
            centro = { lat: 40.452326, lng: -3.696489 };
            break;
        case 63:
            centro = { lat: 40.459081, lng: -3.693029 };
            break;
        case 64:
            centro = { lat: 40.469211, lng: -3.69408 };
            break;
        case 65:
            centro = { lat: 40.466564, lng: -3.702468 };
            break;
        case 66:
            centro = { lat: 40.459403, lng: -3.704318 };
            break;
        case 75:
            centro = { lat: 40.441979, lng: -3.698296 };
            break;
        case 76:
            centro = { lat: 40.441833, lng: -3.71095 };
            break;
        case 84:
            centro = { lat: 40.476389, lng: -3.708886 };
            break;
        case 85:
            centro = { lat: 40.48158, lng: -3.697391 };
            break;
        case 93:
            centro = { lat: 40.449879, lng: -3.714955 };
            break;
        case 94:
          centro = { lat: 40.461083, lng: -3.710878 };
          break;
        case 151:
          centro = { lat: 40.428222, lng: -3.654680 };
          break;
        case 152:
          centro = { lat: 40.432591, lng: -3.644426 };
          break;
        case 153:
          centro = { lat: 40.434504, lng: -3.649170 };
          break;
        case 154:
          centro = { lat: 40.435913, lng: -3.654189 };
          break;
        case 155:
          centro = { lat: 40.442607, lng: -3.653534 };
          break;
        case 156:
          centro = { lat: 40.450914, lng: -3.656763 };
          break;
        case 157:
          centro = { lat: 40.456294, lng: -3.660946 };
          break;
        case 158:
          centro = { lat: 40.464079, lng: -3.666230 };
          break;
        default:
          centro = { lat: 40.459081, lng: -3.693029 };
          break;
    }
    return centro;
  }

}
