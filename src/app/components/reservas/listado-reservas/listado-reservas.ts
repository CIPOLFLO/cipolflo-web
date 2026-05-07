import { Component } from '@angular/core';
import { PageLayout } from '../../../shared/layout/page-layout/page-layout';
import { AppButton } from '../../../shared/components/button/button';

@Component({
  selector: 'app-listado-reservas',
  imports: [PageLayout, AppButton],
  templateUrl: './listado-reservas.html',
  styleUrl: './listado-reservas.css',
})
export class ListadoReservas {}
