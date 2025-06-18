import { Component, OnInit, OnDestroy, input, effect, signal } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { Subscription } from 'rxjs';
import { Transaction } from '../../service/transactions.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-account-summary-chart',
  imports: [ChartModule, CommonModule],
  template: `
    <div class="card !mb-8">
      <div class="font-semibold text-xl mb-4" [ngStyle]="{'color': headerTextColor}">
        Gastos vs. Ingresos por Cuenta
      </div>
      <p-chart *ngIf="chartData && chartOptions" type="bar" [data]="chartData" [options]="chartOptions" class="h-80" />
    </div>
  `,
})
export class AccountSummaryChartComponent implements OnInit, OnDestroy {
  chartData: any;
  chartOptions: any;
  subscription!: Subscription;
  private isDarkMode = signal(false);
  headerTextColor: string = '#000000';

  accountTypeCounts: {
    [accountName: string]: { gastos: number; ingresos: number };
  } = {};

  transacctions = input.required<Transaction[]>();

  constructor() {
    effect(() => {
      this.detectTheme();
      const colors = this.getThemeColors();
      this.headerTextColor = colors.textColor;

      this.chartData = null;
      this.chartOptions = null;

      setTimeout(() => {
        this.initChart();
      }, 0);
    });
  }

  ngOnInit() {
    this.initChart();
    this.observeThemeChanges();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private detectTheme() {
    const darkModeEnabled = localStorage.getItem('darkModeEnabled');
    if (darkModeEnabled !== null) {
      this.isDarkMode.set(darkModeEnabled === 'true');
      return;
    }

    const htmlElement = document.documentElement;
    const isDark = htmlElement.classList.contains('dark') ||
      htmlElement.classList.contains('dark-theme') ||
      htmlElement.getAttribute('data-theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.isDarkMode.set(isDark);
  }

  private observeThemeChanges() {
    const observer = new MutationObserver(() => {
      this.detectTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      this.detectTheme();
    });
  }

  private getThemeColors() {
    const isDark = this.isDarkMode();

    return {
      textColor: isDark ? '#ffffff' : '#000000',
      textMutedColor: isDark ? '#e5e7eb' : '#374151',
      borderColor: isDark ? '#374151' : '#e5e7eb',
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      gridColor: isDark ? '#374151' : '#f3f4f6'
    };
  }

  initChart() {
    const colors = this.getThemeColors();
    this.headerTextColor = colors.textColor;

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
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: colors.textColor,
            usePointStyle: true,
            padding: 20,
            font: {
              size: 14
            }
          },
        },
        title: {
          display: true,
          text: 'Gastos vs. Ingresos por Cuenta (Últimas 20 Transacciones)',
          font: {
            size: 16,
            weight: 'bold',
          },
          color: colors.textColor,
          padding: {
            top: 10,
            bottom: 20
          }
        },
        tooltip: {
          backgroundColor: colors.backgroundColor,
          titleColor: colors.textColor,
          bodyColor: colors.textColor,
          borderColor: colors.borderColor,
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: (context: any) => {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                // *** CAMBIO APLICADO AQUÍ PARA TOOLTIP ***
                return label += '$' + Math.round(context.parsed.y).toLocaleString('es-CL', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                });
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
            color: colors.textMutedColor,
            font: {
              size: 12,
            },
            maxRotation: 45,
            minRotation: 0
          },
          grid: {
            display: false,
            color: 'transparent',
            borderColor: colors.borderColor,
          },
        },
        y: {
          stacked: false,
          beginAtZero: true,
          ticks: {
            color: colors.textMutedColor,
            font: {
              size: 12,
            },
            callback: function (value: any) {
              if (typeof value === 'number') {
                return '$' + Math.round(value).toLocaleString('es-CL', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                });
              }
              return value;
            },
          },
          grid: {
            color: colors.gridColor,
            borderColor: colors.borderColor,
            drawTicks: false,
            lineWidth: 1,
            drawBorder: true
          },
        },
      },
    };
  }
}