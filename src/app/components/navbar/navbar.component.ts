import { Component, OnInit, ViewChild, ElementRef, Input, inject } from '@angular/core';
import { AlertController, Animation, AnimationController, IonicModule, PickerController, ToastController } from '@ionic/angular';
import { PickerOptions } from "@ionic/core";
import { DataFormService } from '../../services/data-form.service';
import { NavbarService } from '../navbar/navbar.service';
import { Subscription, timer, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class NavbarComponent  implements OnInit {

  private pickerController = inject( PickerController );
  private dataForm = inject( DataFormService );
  public toastController = inject( ToastController );
  public alertController = inject( AlertController );
  private navbarService = inject( NavbarService );
  private animationCtrl = inject( AnimationController );

  @ViewChild('myHeader') myHeader!: ElementRef;
  @ViewChild('btnSearch') btnSearch!: ElementRef;
  @Input() pageActive!: string;
  @Input() tareas: boolean = false;
  selectBarrio: string = '';
  objNumero: any;
  barrio: any;
  inputNumero!: number;
  myAnimation!: Animation;
  navObs!: Subscription;
  storaObs!: Subscription;
  delay: Observable<any> = timer(100);

  customPopoverOptions: any = {
    header: 'Barrios',
    subHeader: 'Selecciona un barrio',

  };

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

  constructor() {}



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
    // =================================================
    // Mostrar u ocultal navbar al cambiar de página
    // =================================================
    this.navObs = this.navbarService.navbarOutIn.subscribe( (res: boolean) => {
      if ( res ) {
        // Mostrar Navbar
        this.navbarIn();
      } else {
        this.navbarOut();
      }
    } )
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter');
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter');
  }

  // =================================================
  // Detectar cambios en el selector de barrios
  // =================================================
  ionChangeSelect( event: any ) {
    this.selectBarrio = event.detail.value;
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
    let options: any = [];
    this.barriosHTML.forEach(x => {
      options.push({text:x,value:x.substring(0,2)});
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
  // Función para buscar un parquímetro
  // =================================================
  mostrarParquimetro() {
    if ( !this.selectBarrio ) {
      this.presentToastWithOptions(
        'SELECCIONA UN BARRIO !!'
      );
      return;
    }
    if ( this.pageActive !== 'barrios' ) {
      if ( !this.inputNumero ) {
        this.presentToastWithOptions(
          'ESCRIBE UN NÚMERO !!'
        );
        return;
      }
      if ( this.inputNumero.toString().length > 4 ) {
        console.log('El número debe tener 4 dígitos como máximo!!!');
        this.presentToastWithOptions(
          'NO MÁS DE 4 DÍGITOS !!'
        );
        return;
      }
    }

    const result = this.dataForm.getParkimetro( this.selectBarrio, this.inputNumero );
    if ( !result ) {
      // Presentar una alerta cuando no se encuentre el parquímetro
      this.presentAlert();
    } else {
      // =================================================
      // Enviar resultado a la página principal
      // =================================================
      this.dataForm.sendRegister(result, this.pageActive);
    }
    if ( this.pageActive !== 'barrios' ) {
      this.objNumero.value = "";
      this.inputNumero = 0;
    }
    // if ( this.pageActive === 'home' ) {
    //   this.ocultarNavbar();
    // }
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
    await alert.onDidDismiss();
    // Mostrar navbar al descartar el alert.
    // this.mostrarNavbar();
  }


  ocultarNavbar() {
    const elemento = this.myHeader.nativeElement;
    this.myAnimation = this.animationCtrl.create()
      .addElement(elemento)
      .duration(200)
      .iterations(1)
      .fromTo('transform', 'translateY(0px)', 'translateY(-60px)')
      .fromTo('opacity', '1', '0.2');

    this.myAnimation.play();
  }
  mostrarNavbar() {
    const elemento = this.myHeader.nativeElement;
    this.myAnimation = this.animationCtrl.create()
      .addElement(elemento)
      .duration(200)
      .iterations(1)
      .fromTo('transform', 'translateY(-60px)', 'translateY(0px)')
      .fromTo('opacity', '0.2', '1');

    this.myAnimation.play();
  }
  navbarIn() {
    const elemento = this.myHeader.nativeElement;
    this.myAnimation = this.animationCtrl.create()
      .addElement(elemento)
      .duration(0)
      .iterations(1)
      .fromTo('transform', 'translateY(-60px)', 'translateY(0px)')
      .fromTo('opacity', '0.2', '1');

    this.myAnimation.play();
  }
  navbarOut() {
    const elemento = this.myHeader.nativeElement;
    this.myAnimation = this.animationCtrl.create()
      .addElement(elemento)
      .duration(0)
      .iterations(1)
      .fromTo('transform', 'translateY(0px)', 'translateY(-60px)')
      .fromTo('opacity', '1', '0.2');

    this.myAnimation.play();
  }


}
