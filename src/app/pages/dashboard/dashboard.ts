import { Component, inject, OnInit, signal } from '@angular/core';
import { StatsWidget } from './components/statswidget';
import { GastosPorCategoria } from './components/gastosporcategoria';
import { Transacciones } from './components/transacciones';
import { QueryParametersSummary, QueryParametersTransaction, SummaryResponse, TransactionResponse, TransactionsService } from '../service/transactions.service';
import { IngresosPorCategoria } from "./components/ingresoporcategoria";
import { AccountSummaryChartComponent } from "./components/accountsumarrychart";

@Component({
  selector: 'app-dashboard',
  imports: [StatsWidget, IngresosPorCategoria, GastosPorCategoria, IngresosPorCategoria, Transacciones, AccountSummaryChartComponent],
  template: `
<div class="grid grid-cols-12 gap-8">
    <div class="contents">
        @if (isLoadingSummary()) {
            <div class="col-span-12 sm:col-span-6 lg:col-span-3">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 h-32 flex flex-col justify-center items-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
                </div>
            </div>
            <div class="col-span-12 sm:col-span-6 lg:col-span-3">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 h-32 flex flex-col justify-center items-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
                    <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
                </div>
            </div>
            <div class="col-span-12 sm:col-span-6 lg:col-span-3">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 h-32 flex flex-col justify-center items-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                    <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
                </div>
            </div>
            <div class="col-span-12 sm:col-span-6 lg:col-span-3">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 h-32 flex flex-col justify-center items-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-2"></div>
                    <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-18"></div>
                </div>
            </div>
        } @else {
            <app-stats-widget [summary]="summarySignal()" class="contents" />
        }
    </div>

    <div class="col-span-12 xl:col-span-6">
        @if (isLoadingSummary()) {
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-6 h-96 flex justify-center items-center">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                </div>
            </div>
        } @else {
            <app-gastos-por-categoria [summary]="summarySignal()"/>
        }
    </div>

    <div class="col-span-12 xl:col-span-6">
        @if (isLoadingSummary()) {
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-6 h-96 flex justify-center items-center">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                </div>
            </div>
        } @else {
            <app-ingresos-por-categoria [summary]="summarySignal()"/>
        }
    </div>

    <div class="col-span-12">
        @if (isLoadingTransactions()) {
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-6 h-96 flex justify-center items-center">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                </div>
            </div>
        } @else {
          <app-account-summary-chart [transacctions]="transactionSignal().items"/>
        }
    </div>

    <div class="col-span-12">
        @if (isLoadingTransactions()) {
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-6 h-96 flex justify-center items-center">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                </div>
            </div>
        } @else {
            <app-transacciones [transacciones]="transactionSignal().items.slice(0,5)"/>
        }
    </div>


</div>
`
})
export class Dashboard implements OnInit {

  transactionService = inject(TransactionsService)

  isLoadingSummary = signal<boolean>(false)
  isLoadingTransactions = signal<boolean>(false)

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
    this.isLoadingSummary.set(true)

    const query: QueryParametersSummary = {
      startDate: '2025-01-01',
      endDate: '2025-07-01'
    }

    this.transactionService.getSummary(query).subscribe({
      next: (response) => {
        this.summarySignal.set(response)
        this.isLoadingSummary.set(false)
      },
      error: (error) => {
        this.isLoadingSummary.set(false)
      }
    })
  }

  loadTransactions() {
    this.isLoadingTransactions.set(true)

    const query: QueryParametersTransaction = {
      page: 1,
      results: 20
    }

    this.transactionService.getTransactions(query).subscribe({
      next: (response) => {
        this.transactionSignal.set(response)
        this.isLoadingTransactions.set(false)
      },
      error: (error) => {
        this.isLoadingTransactions.set(false)
      }
    })
  }
}