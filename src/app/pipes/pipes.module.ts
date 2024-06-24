import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImgFabricantePipe } from './img-fabricante.pipe';
import { ContarItemsPipe } from './contar-items.pipe';
import { TarifaPipe } from './tarifa.pipe';
import { IconAliasPipe } from './icon-alias.pipe';



@NgModule({
  declarations: [
    ImgFabricantePipe,
    ContarItemsPipe,
    TarifaPipe,
    IconAliasPipe
  ],
  exports: [
    ImgFabricantePipe,
    ContarItemsPipe,
    TarifaPipe,
    IconAliasPipe
  ],
  imports: [
    CommonModule
  ]
})
export class PipesModule { }
