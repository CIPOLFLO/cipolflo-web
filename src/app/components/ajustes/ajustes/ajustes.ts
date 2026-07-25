import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageLayout } from '../../../shared';
import { CostoCuotaCard } from '../costo-cuota-card/costo-cuota-card';
import { AntiguedadReservasCard } from '../antiguedad-reservas-card/antiguedad-reservas-card';
import { ListadoClientesTelegram } from '../clientes-telegram/listado-clientes-telegram';

@Component({
  standalone: true,
  selector: 'app-ajustes',
  imports: [PageLayout, CostoCuotaCard, AntiguedadReservasCard, ListadoClientesTelegram],
  templateUrl: './ajustes.html',
  styleUrl: './ajustes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ajustes {}
