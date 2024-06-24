import { Component, OnInit, ViewChild, ElementRef, Renderer2, Input, inject, OnDestroy } from '@angular/core';
import { AlertController, Animation, AnimationController, IonicModule, PickerController, ToastController } from '@ionic/angular';
import { PickerOptions } from "@ionic/core";
import { DataFormService } from '../../services/data-form.service';
import { NavbarService } from '../navbar/navbar.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class HeaderComponent  implements OnInit, OnDestroy {

  private pickerController = inject( PickerController );
  private dataForm = inject( DataFormService );
  public toastController = inject( ToastController );
  public alertController = inject( AlertController );
  private navbarService = inject( NavbarService );
  private renderer = inject( Renderer2 );
  private animationCtrl = inject( AnimationController );


  @ViewChild('myHeader') myHeader!: ElementRef;
  @ViewChild('btnSearch') btnSearch!: ElementRef;
  @Input() pageActive!: string;
  selectBarrio: string = "Barrio";
  objNumero: any;
  barrio: any;
  inputNumero!: number;
  myAnimation!: Animation;
  navObs!: Subscription;
  storaObs!: Subscription;

  barriosHTML = [ '151 Ventas', '152 Pueblo Nuevo', '153 Guintana',
                  '154 Concepción', '155 San Pascual', '156 San Juan Bautista',
                  '157 Colina', '158 Atalaya',
                  '44 Guindalera', '45 Lista',
                  '46 Castellana', '51 El Viso',
                  '52 Prosperidad', '53 Ciudad Jardín', '54 Hispanoamérica',
                  '55 Nueva España', '56 Castilla', '61 Bellas Vistas',
                  '62 Cuatro Caminos', '63 Castillejos', '64 Almenara',
                  '65 Valdeacederas', '66 Berruguete', '75 Rios Rosas',
                  '76 Vallehermoso', '84 Pilar', '85 La Paz',
                  '93 Ciudad Universitaria', '94 Valdezarza',
                ];


  ngOnInit() {
    // =================================================
    // Escuchar evento para mostrar el Navbar
    // =================================================
    this.navObs = this.navbarService.mostrarOcultarNavbar.subscribe( (res: boolean) => {
      if ( res ) {
        // Mostrar Navbar
        this.mostrarNavbar();
      } else {
        this.ocultarNavbar();
      }
    } )
  }
  ngOnDestroy(): void {
    this.navObs.unsubscribe();
  }

  // =================================================
  // Desplegable inferior con todos los barrios
  // =================================================
  async showPicker() {
    let options: PickerOptions = {
      buttons: [
        {
          text: "Cancelar",
          role: 'cancel'
        },
        {
          text:'Ok',
          handler:(selectBarrio:any) => {
            for ( const clave in selectBarrio ) {
              this.barrio = selectBarrio[clave];
            }
            this.selectBarrio = this.barrio.value;
          }
        }
      ],
      columns:[{
        name:'Barrio:',
        options:this.getColumnOptions()
      }]
    };

    let picker = await this.pickerController.create(options);
    picker.present()
  }

  // =================================================
  // Función para ordenar los barrios
  // =================================================
  getColumnOptions(){
    let options: any[] = [];
    this.barriosHTML.forEach(x => {
      options.push({text:x,value:x.substring(0,3)});
    });
    return options;
  }
  // =================================================
  // Captura el valor del desplebale de barrios
  // =================================================
  ionChangeInpt(input: any) {
    this.objNumero = input;
    this.inputNumero = input.value;
  }

  // =================================================
  // Función para optener el barrio
  // =================================================
  crearMapaBarrio() {
    if ( !this.barrio ) {
      this.presentToastWithOptions(
        `<strong> SELECCIONA UN BARRIO !! </strong>`
      );
      return;
    }

    const result = this.dataForm.obtenerBarrrio( this.selectBarrio);
    if ( !result ) {
      // Presentar una alerta cuando no se encuentre el parquímetro
      this.presentAlert();
    } else {
      // =================================================
      // Enviar resultado a la página principal
      // =================================================
      this.dataForm.sendArrayBarrio(result);
    }
  }
  // =================================================
  // Mensaje Toast en la parte superior
  // =================================================
  async presentToastWithOptions(mensage: string) {
    const toast = await this.toastController.create({
      message: mensage,
      position: 'top',
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
  // =================================================
  // Mensaje Alert cuando no se encuentra el registro
  // =================================================
  async presentAlert() {
    const alert = await this.alertController.create({
      cssClass: 'alert-custom-class',
      header: 'ERROR',
      subHeader: `BARRIO ${this.selectBarrio} -
                  Número ${this.inputNumero}`,
      message: `<p color="danger">
                <ion-icon name="hand-left-outline"></ion-icon>
                <strong> Parquímetro no encontrado !! </strong>
                </p>`,
      buttons: ['OK']
    });
    await alert.present();
  }


  ocultarNavbar() {
    const elemento = this.myHeader.nativeElement;
    this.myAnimation = this.animationCtrl.create()
      .addElement(elemento)
      .duration(400)
      .iterations(1)
      .fromTo('transform', 'translateY(0px)', 'translateY(-60px)')
      .fromTo('opacity', '1', '0.2');

    this.myAnimation.play();
  }
  mostrarNavbar() {
    const elemento = this.myHeader.nativeElement;
    this.myAnimation = this.animationCtrl.create()
      .addElement(elemento)
      .duration(300)
      .iterations(1)
      .fromTo('transform', 'translateY(-60px)', 'translateY(0px)')
      .fromTo('opacity', '0.2', '1');

    this.myAnimation.play();
  }

  controlDeBotones(page: string) {

    if ( page == 'home' || page == 'barrios' || page == 'soporte' || page == 'incidencias' ) {
      this.renderer.setAttribute( document.querySelector('.btn-search'), 'disabled', 'false' );
    }
    if ( page == 'listas' ) {
      this.renderer.setAttribute( document.querySelector('.btn-search'), 'disabled', 'true' );
    }
  }


}
