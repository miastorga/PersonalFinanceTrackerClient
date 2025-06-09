import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { SummaryResponse, TransactionsService } from '../../service/transactions.service';

@Component({
  standalone: true,
  selector: 'app-gastos-por-categoria',
  imports: [CommonModule, TableModule, ButtonModule, RippleModule],
  template: `<div class="card !mb-8">
  <div class="font-semibold text-xl mb-4">Gastos por Categoria</div>
  <p-table [value]="expensesTableData()" [paginator]="true" [rows]="5" responsiveLayout="scroll">
    <ng-template #header>
      <tr>
        <th pSortableColumn="name">Categoría <p-sortIcon field="name"></p-sortIcon></th>
        <th pSortableColumn="price">Monto <p-sortIcon field="price"></p-sortIcon></th>
        <th pSortableColumn="percentage">% De distribución <p-sortIcon field="percentage"></p-sortIcon></th>     
       </tr>
    </ng-template>
    <ng-template #body let-expense>
      <tr>
        <td style="width: 35%; min-width: 7rem;">{{ expense.name }}</td>
        <td style="width: 35%; min-width: 8rem;">{{ expense.price  }}</td>
        <td style="width: 15%;">{{ expense.percentage }}%</td>
      </tr>
    </ng-template>
  </p-table>
</div>
`,
  providers: []
})
export class GastosPorCategoria {
  transactionService = inject(TransactionsService)
  summary = input.required<SummaryResponse>()

  constructor() { }

  expensesTableData = computed(() => {
    const expenses = this.summary().expensesByCategory;

    const totalCategoryExpenses = Object.values(expenses).reduce((sum, amount) => sum + amount, 0);

    return Object.entries(expenses).map(([name, amount]) => ({
      name: name,
      price: amount,
      percentage: totalCategoryExpenses > 0 ? ((amount / totalCategoryExpenses) * 100).toFixed(1) : 0
    }));
  });
}
