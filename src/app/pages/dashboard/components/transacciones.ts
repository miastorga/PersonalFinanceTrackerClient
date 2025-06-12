import { Component, inject, input } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Transaction, TransactionsService } from '../../service/transactions.service';

@Component({
  standalone: true,
  selector: 'app-transacciones',
  imports: [CommonModule, TableModule, ButtonModule, RippleModule],
  template: `<div class="card !mb-8">
  <div class="font-semibold text-xl mb-4">Ultimas 5 Transacciones</div>
  <p-table [value]="transacciones().slice(0,5)"  [rows]="6" responsiveLayout="scroll">
    <ng-template #header>
      <tr>
        <th >Monto </th>
        <th >Categoria </th>
        <th >Fecha</th>     
        <th >Descripcion</th>     
        <th >Tipo de Transaccion</th>
       </tr>
    </ng-template>
    <ng-template #body let-transaccion>
      <tr>
        <td style="width: 35%; min-width: 7rem;">{{ transaccion.amount | currency:'USD':'symbol':'1.0-0' }}</td>
        <td style="width: 35%; min-width: 8rem;">{{ transaccion.categoryName  }}</td>
        <td style="width: 15%;">{{ transaccion.date | date:'dd-MM-yyyy'}}</td>
        <td style="width: 15%;">{{ transaccion.description }}</td>
        <td style="width: 15%;">{{ transaccion.transactionType }}</td>
      </tr>
    </ng-template>
  </p-table>
</div>
`,
  providers: []
})
export class Transacciones {
  transactionService = inject(TransactionsService)
  transacciones = input.required<Transaction[]>()

  constructor() { }
}
