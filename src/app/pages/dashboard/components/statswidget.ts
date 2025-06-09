import { AfterContentInit, AfterViewInit, Component, computed, inject, input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QueryParametersSummary, SummaryResponse, TransactionsService } from '../../service/transactions.service';

@Component({
  standalone: true,
  selector: 'app-stats-widget',
  imports: [CommonModule],
  template: `<div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Ingresos</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">&#36;{{summary().totalIncome}}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-shopping-cart text-blue-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium"> {{getObjectLength(summary().incomeByCategory)}} fuentes</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Gastos</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">&#36;{{summary().totalExpenses}}</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-orange-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{getObjectLength(summary().expensesByCategory)}} categorias</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Balance</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">&#36;{{summary().balance}}</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-cyan-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">{{summary().balanceChange}}</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Transacciones</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{summary().transactionCount}} movimientos</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-comment text-purple-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Prom: &#36;{{summary().averageTransactionAmount}} </span>
            </div>
        </div>`
})
export class StatsWidget {
  summary = input.required<SummaryResponse>()

  getObjectLength(obj: { [key: string]: number }): number {
    return Object.keys(obj).length;
  }
}
