// account-summary-chart.component.ts

import { Component, OnInit, OnDestroy, input } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { Subscription } from 'rxjs';
import { Transaction } from '../../service/transactions.service';

@Component({
  standalone: true,
  selector: 'app-account-summary-chart',
  imports: [ChartModule],
  template: `
    <div class="card !mb-8">
      <div class="font-semibold text-xl mb-4">
        Gastos vs. Ingresos por Cuenta
      </div>
      <p-chart type="bar" [data]="chartData" [options]="chartOptions" class="h-80" />
    </div>
  `,
})
export class AccountSummaryChartComponent implements OnInit, OnDestroy {
  chartData: any;
  chartOptions: any;
  subscription!: Subscription;

  accountTypeCounts: {
    [accountName: string]: { gastos: number; ingresos: number };
  } = {};

  transacctions = input.required<Transaction[]>();

  ngOnInit() {
    this.initChart();
    console.log('Transacciones recibidas en ngOnInit:', this.transacctions());
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  initChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const borderColor = documentStyle.getPropertyValue('--surface-border');
    const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

    const allTransactions = this.transacctions();
    const latest20Transactions = allTransactions.slice(-20);

    const accountExpenseAmounts: { [key: string]: number } = {};
    const accountIncomeAmounts: { [key: string]: number } = {};
    this.accountTypeCounts = {};

    const uniqueAccountNames = new Set<string>();
    latest20Transactions.forEach((transaction) => {
      const accountDisplayName = transaction.accountName || 'Sin Nombre de Cuenta';
      uniqueAccountNames.add(accountDisplayName);
    });

    uniqueAccountNames.forEach((name) => {
      accountExpenseAmounts[name] = 0;
      accountIncomeAmounts[name] = 0;
      this.accountTypeCounts[name] = { gastos: 0, ingresos: 0 };
    });

    latest20Transactions.forEach((transaction) => {
      const accountDisplayName = transaction.accountName || 'Sin Nombre de Cuenta';

      if (transaction.transactionType === 'gasto') {
        accountExpenseAmounts[accountDisplayName] += transaction.amount;
        this.accountTypeCounts[accountDisplayName].gastos++;
      } else if (transaction.transactionType === 'ingreso') {
        accountIncomeAmounts[accountDisplayName] += transaction.amount;
        this.accountTypeCounts[accountDisplayName].ingresos++;
      }
    });

    const labels = Array.from(uniqueAccountNames);
    const expenseData = labels.map((label) => accountExpenseAmounts[label]);
    const incomeData = labels.map((label) => accountIncomeAmounts[label]);

    console.log('Conteo de transacciones por tipo y cuenta:', this.accountTypeCounts);

    this.chartData = {
      labels: labels,
      datasets: [
        {
          type: 'bar',
          label: 'Gastos',
          backgroundColor: '#ef4444',
          data: expenseData,
          barThickness: 20,
          borderRadius: {
            topLeft: 4,
            topRight: 4,
            bottomLeft: 0,
            bottomRight: 0,
          },
          borderSkipped: false,
        },
        {
          type: 'bar',
          label: 'Ingresos',
          backgroundColor: '#22c55e',
          data: incomeData,
          barThickness: 20,
          borderRadius: {
            topLeft: 4,
            topRight: 4,
            bottomLeft: 0,
            bottomRight: 0,
          },
          borderSkipped: false,
        },
      ],
    };

    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
        title: {
          display: true,
          text: 'Gastos vs. Ingresos por Cuenta (Últimas 20 Transacciones)',
          font: {
            size: 18,
            weight: 'bold',
          },
          color: textColor,
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y.toLocaleString('es-CL');
              }
              return label;
            },
            afterLabel: (context: any) => {
              const accountName = context.label;
              const datasetLabel = context.dataset.label;

              let count = 0;
              if (this.accountTypeCounts[accountName]) {
                if (datasetLabel === 'Gastos') {
                  count = this.accountTypeCounts[accountName].gastos;
                } else if (datasetLabel === 'Ingresos') {
                  count = this.accountTypeCounts[accountName].ingresos;
                }
              }
              return `Transacciones: ${count}`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: false,
          ticks: {
            color: textMutedColor,
            font: {
              size: 12,
            },
          },
          grid: {
            color: 'transparent',
            borderColor: 'transparent',
          },
        },
        y: {
          stacked: false,
          beginAtZero: true,
          ticks: {
            color: textMutedColor,
            font: {
              size: 12,
            },
            callback: function (value: any) {
              if (typeof value === 'number') {
                return value.toLocaleString('es-CL');
              }
              return value;
            },
          },
          grid: {
            color: borderColor,
            borderColor: 'transparent',
            drawTicks: false,
          },
        },
      },
    };
  }
}