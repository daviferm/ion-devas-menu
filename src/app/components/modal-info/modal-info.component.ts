import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';

@Component({
  selector: 'modal-info',
  templateUrl: './modal-info.component.html',
  styleUrls: ['./modal-info.component.scss'],
  standalone: true,
  imports: [ CommonModule, IonicModule]
})
export class ModalInfoComponent {

  private modalCtrl = inject( ModalController );

  @Input() pageActive!: string;
  @Input() modalOpen!: boolean;
  @Output() closeModal: EventEmitter<boolean> = new EventEmitter();

  constructor() {}


  ionModalDidDismiss() {
      this.closeModal.emit( true );
  }


}
