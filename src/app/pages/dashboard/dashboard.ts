import { Component, inject, OnInit, signal } from '@angular/core';
import { StatsWidget } from './components/statswidget';
import { GastosPorCategoria } from './components/gastosporcategoria';
import { Transacciones } from './components/transacciones';
import { QueryParametersSummary, QueryParametersTransaction, SummaryResponse, TransactionResponse, TransactionsService } from '../service/transactions.service';
import { IngresosPorCategoria } from "./components/ingresoporcategoria";

@Component({
  selector: 'app-dashboard',
  imports: [StatsWidget, IngresosPorCategoria, GastosPorCategoria, IngresosPorCategoria, Transacciones],
  template: `
<div class="grid grid-cols-12 gap-8">
    <app-stats-widget [summary]="summarySignal()" class="contents" />
    <div class="col-span-12 xl:col-span-6">
        <app-gastos-por-categoria [summary]="summarySignal()"/>
    </div>
    <div class="col-span-12 xl:col-span-6">
        <app-ingresos-por-categoria [summary]="summarySignal()"/>
    </div>

    <!-- Ocupa todas las 12 columnas = ancho completo -->
    <div class="col-span-12">
        <app-transacciones [transacciones]="transactionSignal().items"/>
    </div>
</div>
    `
})
export class Dashboard implements OnInit {

  transactionService = inject(TransactionsService)
  summarySignal = signal<SummaryResponse>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    startDate: '',
    endDate: '',
    period: '',
    expensesByCategory: {},
    incomeByCategory: {},
    balanceByAccount: {},
    transactionCount: 0,
    averageTransactionAmount: 0,
    topExpenseCategory: '',
    topIncomeCategory: '',
    previousPeriodBalance: 0,
    balanceChange: 0,
    balanceChangePercentage: 0
  })
  transactionSignal = signal<TransactionResponse>({
    items: [],
    totalCount: 0,
    pageSize: 0,
    currentPage: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  })

  ngOnInit(): void {
    this.loadTransactionSummary()
    this.loadTransactions()
  }

  loadTransactionSummary() {
    const query: QueryParametersSummary = {
      startDate: '2025-01-01',
      endDate: '2025-07-01'
    }
    this.transactionService.getSummary(query).subscribe({
      next: (response) => {
        this.summarySignal.set(response)
      },
      error: (error) => {
        console.error('Error getting summary:', error);
      }
    })
  }

  loadTransactions() {
    const query: QueryParametersTransaction = {
      page: 1,
      results: 6
    }
    this.transactionService.getTransactions(query).subscribe({
      next: (response) => {
        console.log('Transaction data:', response.items);
        this.transactionSignal.set(response)
      },
      error: (error) => {
        console.error('Error getting summary:', error);
      }
    })

  }
}
