import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CreateTransaction, Transaction, TransactionResponse, TransactionsService } from '../service/transactions.service';
import { forkJoin } from 'rxjs';
import { CategoriesService, Category } from '../service/categories.service';
import { Account, AccountsService } from '../service/accounts.service';
import { PaginationService } from '../service/pagination.service';
import { PrimengConfigService } from '../service/primengconfig.service';

@Component({
  selector: 'app-transactions-crud',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    RatingModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RadioButtonModule,
    InputNumberModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    CalendarModule,
    TooltipModule,
    MultiSelectModule,
    SliderModule,
    ProgressBarModule,
    ToggleButtonModule
  ],
  template: `
  <div class="header-section p-4 mb-4 surface-card border-round shadow-2" style="background: var(--surface-card); border: 1px solid var(--surface-border);">
    <div class="header-content flex justify-content-between align-items-center mb-3">
      <h1 class="title text-color m-0 flex align-items-center">
        <i class="pi pi-arrow-right-arrow-left text-primary mr-3" style="font-size: 1.5rem; vertical-align: middle;"></i>
        Gestión de Transacciones
      </h1>
      <div class="flex gap-2 ml-auto">
        <p-button
          label="Nueva Cuenta"
          icon="pi pi-plus"
          (click)="showAddTransactionDialog()"
          severity="success"
          class="p-button-raised">
        </p-button>
        <p-button
          severity="danger"
          label="Eliminar Seleccionadas"
          icon="pi pi-trash"
          outlined
          (onClick)="deleteSelectedTransactions()"
          [disabled]="!selectedTransactions || selectedTransactions.length === 0">
        </p-button>
      </div>
    </div>
  </div>
    <div class="card">
          <p-toast
            position="top-right"
            [baseZIndex]="5000"
            [breakpoints]="{'960px': {width: '100%', right: '0', left: '0'}}">
          </p-toast>
      <p-table
        #dt1
        [value]="paginationService.items()"
        dataKey="transactionId" 
        selectionMode="multiple"  
        [showCurrentPageReport]="false"
        [paginator]="false"
        [rowHover]="true"
        [showGridlines]="true"
        [globalFilterFields]="['amount', 'categoryName', 'description', 'transactionType']"
        responsiveLayout="scroll"
        [(selection)]="selectedTransactions"
        [tableStyle]="{ 'min-width': '75rem' }"
        [sortField]="'monto'"
        [sortOrder]="1"
      >
        <ng-template #caption>
          <div class="flex justify-between items-center flex-column sm:flex-row">
            <div class="flex gap-2">
              <button pButton label="Limpiar" class="p-button-outlined mb-2" icon="pi pi-filter-slash" (click)="clear(dt1)"></button>
              <!-- <p-iconfield iconPosition="left" class="ml-auto">
                <p-inputicon>
                  <i class="pi pi-search"></i>
                </p-inputicon>
                <input pInputText type="text" (input)="onGlobalFilter(dt1, $event)" placeholder="Buscar transacciones..." />
              </p-iconfield> -->
            </div>
          </div>
        </ng-template>

        <ng-template #header>
          <tr>
            <th style="width: 3rem">
              <p-tableHeaderCheckbox />
            </th>
            <th style="min-width: 12rem" >
              <div class="flex justify-between items-center">
                Id
              </div>
            </th>
            <th style="min-width: 12rem" pSortableColumn="amount">
              <div class="flex justify-between items-center">
                Monto
              <p-columnFilter 
                type="numeric" 
                field="amount" 
                display="menu" 
                placeholder="Buscar por monto"
                [matchModeOptions]="primengConfig.numberFilterOptions">
              </p-columnFilter>

                <p-sortIcon field="amount"></p-sortIcon>
              </div>
            </th>
            <th style="min-width: 12rem">
              <div class="flex justify-between items-center">
                Categoría
                <p-columnFilter 
                        type="text" 
                        field="categoryName" 
                        display="menu" 
                        placeholder="Buscar por categoría"
                        [matchModeOptions]="primengConfig.textFilterOptions">
                      </p-columnFilter>
              </div>
            </th>
            <th style="min-width: 14rem" pSortableColumn="date">
              <div class="flex justify-between items-center">
                Fecha
                <p-columnFilter
                  field="date"
                  matchMode="dateIs"
                  display="menu"
                  [matchModeOptions]="primengConfig.dateFilterOptions">
                  <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                    <p-calendar
                      [ngModel]="value"
                      (onSelect)="filter($event)"
                      (onClearClick)="filter(null)"
                      placeholder="Seleccionar fecha"
                      [showIcon]="true"
                      [showClear]="false"
                      dateFormat="dd/mm/yy"
                      [readonlyInput]="true">
                    </p-calendar>
                  </ng-template>
                </p-columnFilter>
                <p-sortIcon field="date"></p-sortIcon>
              </div>
            </th>
            <th style="min-width: 10rem" >
              <div class="flex justify-between items-center">
                Descripción
                <p-columnFilter 
                      type="text" 
                      field="description" 
                      display="menu" 
                      placeholder="Buscar por descripción"
                      [matchModeOptions]="primengConfig.textFilterOptions">
                    </p-columnFilter>
              </div>
            </th>
            <th style="min-width: 10rem" pSortableColumn="transactionType">
              <div class="flex justify-between items-center">
                Tipo
                <!-- <p-columnFilter type="text" field="transactionType" display="menu" placeholder="Buscar por tipo"></p-columnFilter> -->
                <p-sortIcon field="transactionType"></p-sortIcon>
              </div>
            </th>
            <th style="min-width: 12rem" pSortableColumn="accountId">
              <div class="flex justify-between items-center">
                Cuenta
                <p-columnFilter 
                    type="text" 
                    field="accountId" 
                    display="menu" 
                    placeholder="Buscar por cuenta"
                    [matchModeOptions]="primengConfig.textFilterOptions">
                  </p-columnFilter>
                <p-sortIcon field="accountId"></p-sortIcon>
              </div>
            </th>
            <th style="min-width: 12rem">Acciones</th>
          </tr>
        </ng-template>

        <ng-template #body let-transaction>
          <tr>
            <td style="width: 3rem">
              <p-tableCheckbox [value]="transaction" />
            </td>
            <td>
              <div class="flex items-center gap-2">
                <span>{{ transaction.transactionId.slice(0,6) }}...</span>
              </div>
            </td>
            <td>
              {{ transaction.amount | currency:'USD':'symbol':'1.0-0' }}
            </td>
            <td>
              <div class="flex items-center gap-2">
                <span>{{ transaction.categoryName }}</span>
              </div>
            </td>
            <td>
              {{transaction.date | date:'dd-MM-yyyy'}}
            </td>
            <td>
              {{transaction.description}}
            </td>
            <td>
              <p-tag 
                [value]="transaction.transactionType | uppercase" 
                [severity]="getTransactionTypeSeverity(transaction.transactionType)"
                [severity]=""
                styleClass="dark:!bg-surface-900" 
              />
            </td> 
            <td>
              <p-tag [value]="getAccountName(transaction) ?? 'Sin Cuenta'" styleClass="dark:!bg-surface-900 " [severity]="getTransactionAccountIdSeverity(transaction.accountId)"/>
            </td>
            <td>
              <p-button 
                icon="pi pi-pencil" 
                class="mr-2" 
                [rounded]="true" 
                [outlined]="true" 
                (click)="editTransaction(transaction)" />
              <p-button 
                icon="pi pi-trash" 
                severity="danger" 
                [rounded]="true" 
                [outlined]="true" 
                (click)="deleteTransaction(transaction)" />
            </td>
          </tr>
             <!-- MODAL PARA AGREGAR/EDITAR TRANSACCIÓN -->
     
        </ng-template>

        <ng-template #emptymessage>
          <tr>
            <td colspan="9" class="text-center py-12">
              <div *ngIf="paginationService.items().length === 0 && !paginationService.loading()"
                class="empty-state text-center surface-card border-round shadow-1 p-6">
                  <i class="pi pi-arrow-right-arrow-left text-8xl text-color-secondary mb-4 block" style="font-size: 40px;"></i>
                  <h3 class="text-color font-bold mb-2">No hay transacciones registradas</h3>
                  <p class="text-color-secondary mb-4 line-height-3">
                    Crea tu primera transaccion para comenzar a gestionar tus finanzas personales
                  </p>
                  <p-button
                    label="Nueva Transaccion"
                    icon="pi pi-plus"
                    [outlined]="true"
                    severity="success"
                    (click)="showAddTransactionDialog()">
                  </p-button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- SPINNER DE CARGA -->
      @if(paginationService.loading() == true ){
        <div class="flex justify-center items-center py-8">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #6366f1;"></i>
        </div>
      }
      <p-dialog
      [header]="editMode ? 'Editar Transacción' : 'Nueva Transacción'"
      [(visible)]="displayAddTransactionDialog"
      [modal]="true"
      [style]="{width: '450px'}"
      [draggable]="false"
      [resizable]="false"
      [closable]="true">

              <ng-template #content>
                <form [formGroup]="transactionForm" (ngSubmit)="onSubmitTransaction()">
                  <div class="grid grid-cols-1 gap-4">

                    <!-- Monto -->
                    <div class="field">
                      <label for="amount" class="block text-sm font-medium mb-2">Monto *</label>
                      <p-inputNumber
                        id="amount"
                        formControlName="amount"
                        mode="decimal"
                        locale="es-CO"
                        [useGrouping]="true"
                        placeholder="0"
                        prefix="$"
                        class="w-full">
                      </p-inputNumber>
                      <small class="text-red-500" *ngIf="transactionForm.get('amount')?.invalid && transactionForm.get('amount')?.touched">
                        {{ getAmountErrorMessage() }}
                      </small>
                    </div>

                    <!-- Descripción -->
                    <div class="field">
                      <label for="description" class="block text-sm font-medium mb-2">Descripción *</label>
                      <textarea
                        id="description"
                        pInputTextarea
                        formControlName="description"
                        placeholder="Ingrese una descripción"
                        class="w-full">
                      </textarea>
                        <small class="text-red-500" *ngIf="transactionForm.get('description')?.invalid && transactionForm.get('description')?.touched">
                          {{ getDescriptionErrorMessage() }}
                        </small>
                    </div>

                    <!-- Fecha -->
                    <div class="field">
                      <label for="date" class="block text-sm font-medium mb-2">Fecha *</label>
                      <p-calendar
                        id="date"
                        formControlName="date"
                        dateFormat="dd/mm/yy"
                        [showIcon]="true"
                        placeholder="Seleccione una fecha"
                        class="w-full">
                      </p-calendar>
                      <small class="text-red-500" *ngIf="transactionForm.get('date')?.invalid && transactionForm.get('date')?.touched">
                        La fecha es requerida
                      </small>
                    </div>

                    <!-- Tipo de Transacción -->
                    <div class="field">
                      <label for="transactionType" class="block text-sm font-medium mb-2">Tipo de Transacción *</label>
                      <p-select
                        id="transactionType"
                        formControlName="transactionType"
                        [options]="transactionTypes"
                        placeholder="Seleccione un tipo"
                        optionLabel="label"
                        optionValue="value"
                        class="w-full"
                        [appendTo]="'body'">
                      </p-select>
                      <small class="text-red-500" *ngIf="transactionForm.get('transactionType')?.invalid && transactionForm.get('transactionType')?.touched">
                        El tipo de transacción es requerido
                      </small>
                    </div>

                    <!-- Categoría -->
                    <div class="field">
                      <label for="categoryName" class="block text-sm font-medium mb-2">Categoría *</label>
                      <p-select
                        id="categoryName"
                        formControlName="categoryName"
                        [options]="categoriesSignal()"
                        placeholder="Seleccione una categoría"
                        optionLabel="categoryName"
                        optionValue="categoryId"
                        class="w-full"
                        [appendTo]="'body'">
                      </p-select>
                      <small class="text-red-500" *ngIf="transactionForm.get('categoryName')?.invalid && transactionForm.get('categoryName')?.touched">
                        La categoría es requerida
                      </small>
                    </div>

                    <!-- Cuenta -->
                    <div class="field">
                      <label for="accountId" class="block text-sm font-medium mb-2">Cuenta</label>
                      <p-select
                        id="accountId"
                        formControlName="accountId"
                        placeholder="Seleccione una cuenta"
                        [options]="accountsSignal()"
                        optionLabel="accountName"
                        optionValue="accountId"
                        class="w-full"
                        [appendTo]="'body'"
                        [style]="{'min-width': '100%'}">
                      </p-select>
                    </div>

                  </div>
                </form>
              </ng-template>


              <ng-template #footer>
                <div class="flex justify-end gap-2">
                  <button
                    pButton
                    label="Cancelar"
                    icon="pi pi-times"
                    class="p-button-text"
                    (click)="hideAddTransactionDialog()">
                  </button>
                  <button
                    pButton
                    [label]="editMode ? 'Actualizar' : 'Guardar'"
                    icon="pi pi-check"
                    class="p-button-success"
                    [disabled]="transactionForm.invalid || savingTransaction"
                    [loading]="savingTransaction"
                    (click)="onSubmitTransaction()">
                  </button>
                </div>
              </ng-template>
            </p-dialog>
          <!-- PAGINACIÓN PERSONALIZADA -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 gap-3 sm:gap-0">
  <!-- Info de registros -->
  <div class="flex items-center">
    <span class="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
      <span class="font-medium text-gray-800 dark:text-gray-200">{{ paginationService.getStartRecord() }}-{{ paginationService.getEndRecord() }}</span>
      de
      <span class="font-medium text-gray-800 dark:text-gray-200">{{ paginationService.paginationData().totalCount }}</span>
      registros
    </span>
  </div>

  <!-- Controles de paginación -->
  <div class="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
    <button
      pButton
      icon="pi pi-angle-double-left"
      class="p-button-text p-button-sm !text-gray-500 dark:!text-gray-400 hover:!text-blue-600 dark:hover:!text-blue-400 hover:!bg-blue-50 dark:hover:!bg-blue-900/20 !border-0 !rounded-md"
      [disabled]="!paginationService.paginationData().hasPreviousPage || paginationService.loading()"
      (click)="goToFirstPage()"
      pTooltip="Primera página">
    </button>
    <button
      pButton
      icon="pi pi-angle-left"
      class="p-button-text p-button-sm !text-gray-500 dark:!text-gray-400 hover:!text-blue-600 dark:hover:!text-blue-400 hover:!bg-blue-50 dark:hover:!bg-blue-900/20 !border-0 !rounded-md"
      [disabled]="!paginationService.paginationData().hasPreviousPage || paginationService.loading()"
      (click)="goToPreviousPage()"
      pTooltip="Página anterior">
    </button>

    <div class="flex items-center px-3 py-1 bg-gray-50 dark:bg-gray-700 rounded-md mx-1">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ paginationService.paginationData().currentPage }}
      </span>
      <span class="text-sm text-gray-500 dark:text-gray-400 mx-1">/</span>
      <span class="text-sm text-gray-600 dark:text-gray-300">
        {{ paginationService.paginationData().totalPages }}
      </span>
    </div>

    <button
      pButton
      icon="pi pi-angle-right"
      class="p-button-text p-button-sm !text-gray-500 dark:!text-gray-400 hover:!text-blue-600 dark:hover:!text-blue-400 hover:!bg-blue-50 dark:hover:!bg-blue-900/20 !border-0 !rounded-md"
      [disabled]="!paginationService.paginationData().hasNextPage || paginationService.loading()"
      (click)="goToNextPage()"
      pTooltip="Página siguiente">
    </button>
    <button
      pButton
      icon="pi pi-angle-double-right"
      class="p-button-text p-button-sm !text-gray-500 dark:!text-gray-400 hover:!text-blue-600 dark:hover:!text-blue-400 hover:!bg-blue-50 dark:hover:!bg-blue-900/20 !border-0 !rounded-md"
      [disabled]="!paginationService.paginationData().hasNextPage || paginationService.loading()"
      (click)="goToLastPage()"
      pTooltip="Última página">
    </button>
  </div>

  <!-- Selector de filas por página -->
  <div class="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
    <label class="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">Filas:</label>
    <p-select
      [options]="paginationService.rowsPerPageOptions"
      [(ngModel)]="currentPageSize"
      (onChange)="onRowsPerPageChange($event)"
      [style]="{'min-width': '70px'}"
      placeholder="5"
      styleClass="dark-select compact-select">
    </p-select>
  </div>
</div>
    </div>
    <p-confirmdialog [style]="{ width: '450px' }" />
  `,
  styles: `
    .header-section {
  margin-bottom: 2rem;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  padding: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .title {
    font-size: 1.5rem;
  }
}
     .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-color-secondary);
      background: var(--surface-card);
      // border: 1px solid var(--surface-border);
      border-radius: 12px;
    }

    .empty-state i {
      font-size: 4rem;
      margin-bottom: 1rem;
      color: var(--text-color-secondary);
    }

    .empty-state h3 {
      color: var(--text-color);
      margin-bottom: 1rem;
    }
    .p-datatable-frozen-tbody {
      font-weight: bold;
    }

    .p-datatable-scrollable .p-frozen-column {
      font-weight: bold;
    }

    .pagination-container {
      border-top: 1px solid #e5e7eb;
      background-color: #f9fafb;
    }
  `,
  providers: [ConfirmationService, MessageService]
})
export class TransactionsCRUD implements OnInit {
  // Servicios inyectados
  fb = inject(FormBuilder);
  messageService = inject(MessageService);
  transactionService = inject(TransactionsService);
  confirmationService = inject(ConfirmationService);
  categoriesService = inject(CategoriesService)
  accountService = inject(AccountsService)
  paginationService = inject<PaginationService<Transaction>>(PaginationService)
  primengConfig = inject(PrimengConfigService)


  editMode: boolean = false;
  currentTransactionId: string | null = null;

  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('dt1') dt1!: Table;

  // Signals para transacciones y paginación
  categoriesSignal = signal<Category[]>([])
  accountsSignal = signal<Account[]>([])
  paginationData = signal<{
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }>({
    totalCount: 0,
    pageSize: 5,
    currentPage: 1,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  });

  // Variables para el formulario y modal
  displayAddTransactionDialog = false;
  transactionForm!: FormGroup;
  savingTransaction = false;
  selectedTransactions!: Transaction[] | null;

  transactionTypes = [
    { label: 'Ingreso', value: 'ingreso' },
    { label: 'Gasto', value: 'gasto' },
  ];

  currentPageSize = 5;

  constructor() {
    this.initializeForm();
  }

  ngOnInit() {
    this.paginationService.initialize(this.currentPageSize);
    this.loadTransactions()
    this.loadCategories()
    this.loadAccounts()
  }

  initializeForm() {
    this.transactionForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(1), Validators.max(1000000000)]],
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]],
      date: [new Date(), Validators.required],
      transactionType: ['', Validators.required],
      categoryName: ['', Validators.required],
      accountId: ['']
    });
  }

  loadTransactions() {
    this.paginationService.loadData(
      (page, pageSize) => this.transactionService.getTransactions({ page, results: pageSize }),
      {
        onError: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Error al cargar las transacciones: ${error.message.toLowerCase() || 'Error desconocido'}`
          });
        }
      }
    );
  }

  getAmountErrorMessage(): string {
    const control = this.transactionForm.get('amount');

    // Prioridad: required > min > max
    if (control?.errors?.['required']) {
      return 'El monto es requerido';
    }
    if (control?.errors?.['min']) {
      return 'El monto debe ser mayor a 0';
    }
    if (control?.errors?.['max']) {
      return 'El monto no puede superar los 1,000,000,000';
    }

    return '';
  }

  getDescriptionErrorMessage(): string {
    const control = this.transactionForm.get('description');

    // Prioridad: required > minlength > maxlength
    if (control?.errors?.['required']) {
      return 'La descripción es requerida';
    }
    if (control?.errors?.['minlength']) {
      return 'La descripción debe tener al menos 3 caracteres';
    }
    if (control?.errors?.['maxlength']) {
      return 'La descripción no puede superar los 500 caracteres';
    }

    return '';
  }

  getAccountName(transaction: Transaction) {
    return this.accountsSignal().find(a => a.accountId == transaction.accountId)?.accountName
  }

  loadCategories() {
    this.categoriesService.getCategories().subscribe({
      next: (response: Category[]) => {

        this.categoriesSignal.set(response)
      },
      error: (error) => {
      }
    })
  }

  loadAccounts() {
    this.accountService.getAccounts().subscribe({
      next: (response: Account[]) => {

        this.accountsSignal.set(response)
      },
      error: (error) => {
      }
    })
  }
  // Métodos para el modal
  showAddTransactionDialog() {
    this.editMode = false;
    this.currentTransactionId = null;
    this.displayAddTransactionDialog = true;
    this.resetForm();
  }

  editTransaction(transaction: Transaction) {
    this.editMode = true;
    this.currentTransactionId = transaction.transactionId || null;
    this.displayAddTransactionDialog = true;


    this.transactionForm.patchValue({
      amount: transaction.amount,
      description: transaction.description,
      date: new Date(transaction.date),
      transactionType: transaction.transactionType,
      categoryName: transaction.categoryId,
      accountId: transaction.accountId
    });
  }

  hideAddTransactionDialog() {
    this.displayAddTransactionDialog = false;
    this.resetForm();
  }

  resetForm() {
    this.transactionForm.reset();
    this.transactionForm.patchValue({
      date: new Date()
    });
    this.savingTransaction = false;
  }

  prepareDataForSubmit() {
    const formValue = this.transactionForm.value;
    return {
      amount: Number(formValue.amount) || 0,
      transactionType: formValue.transactionType || '',
      categoryId: formValue.categoryName || '', // Ajustar según tu lógica de categorías
      date: formValue.date instanceof Date ? formValue.date.toISOString() : formValue.date,
      description: formValue.description || '',
      accountId: formValue.accountId || null
    };
  }

  onSubmitTransaction() {
    if (this.transactionForm.valid) {
      this.savingTransaction = true;

      const formData = this.transactionForm.value;
      const transactionData: CreateTransaction = {
        amount: formData.amount,
        description: formData.description,
        date: formData.date.toISOString(),
        transactionType: formData.transactionType,
        categoryId: formData.categoryName,// Es realmente el ID
        accountId: formData.accountId
      };

      try {
        if (this.editMode) {
          this.transactionService.updateTransaction(this.currentTransactionId!, transactionData).subscribe({
            next: (response) => {
              this.loadTransactions();
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Transacción actualizada exitosamente'
              });
              this.hideAddTransactionDialog();
              this.savingTransaction = false;
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `Error al actualizar la transacción ${error.message}`
              });
              this.savingTransaction = false;
            }
          })
        } else {
          this.transactionService.createTransaction(transactionData).subscribe({
            next: (response) => {
              this.loadTransactions();
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Transacción creada exitosamente'
              });
              this.hideAddTransactionDialog();
              this.savingTransaction = false;
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `Error al crear la transacción ${error.message}`
              });
              this.savingTransaction = false;
            }
          })
        }
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.editMode ? 'Error al actualizar la transacción' : 'Error al crear la transacción'
        });
        this.savingTransaction = false;
      }
    } else {
      Object.keys(this.transactionForm.controls).forEach(key => {
        this.transactionForm.get(key)?.markAsTouched();
      });

      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos requeridos'
      });
    }
  }

  // Métodos para eliminar transacciones
  deleteTransaction(transaction: Transaction) {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la transacción "${transaction.description}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.transactionService.removeTransaction(transaction.transactionId).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Transacción eliminada exitosamente'
            });

            this.hideAddTransactionDialog();
            this.loadTransactions();
            this.savingTransaction = false;
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Error al eliminar la transacción ${error.message}`
            });
            this.savingTransaction = false;
          }
        })
      }
    });
  }

  deleteSelectedTransactions() {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar las transacciones seleccionadas?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deleteObservables = this.selectedTransactions?.map(transaction =>
          this.transactionService.removeTransaction(transaction.transactionId)
        );

        forkJoin(deleteObservables!).subscribe({
          next: (responses) => {

            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `${this.selectedTransactions?.length} transacciones eliminadas exitosamente`
            });

            this.selectedTransactions = [];
            this.loadTransactions();
            this.savingTransaction = false;
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Error al eliminar algunas transacciones ${error.message}`
            });
            this.selectedTransactions = [];
            this.loadTransactions();
            this.savingTransaction = false;
          }
        });
      }
    });
  }

  // Métodos de paginación
  goToFirstPage() {
    if (this.paginationService.goToFirstPage()) {
      this.loadTransactions();
    }
  }

  goToPreviousPage() {
    if (this.paginationService.goToPreviousPage()) {
      this.loadTransactions();
    }
  }

  goToNextPage() {
    if (this.paginationService.goToNextPage()) {
      this.loadTransactions();
    }
  }

  goToLastPage() {
    if (this.paginationService.goToLastPage()) {
      this.loadTransactions();
    }
  }

  onRowsPerPageChange(event: any) {
    this.paginationService.changePageSize(event.value);
    this.currentPageSize = event.value;
    this.loadTransactions();
  }

  // Métodos de utilidad
  onGlobalFilter(table: Table, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    if (this.filter?.nativeElement) {
      this.filter.nativeElement.value = '';
    }
    this.paginationData.update(data => ({ ...data, currentPage: 1 }));
    this.loadTransactions();
  }

  exportCSV() {
    this.dt1.exportCSV();
  }

  getTransactionTypeSeverity(transactionType: string): string {
    switch (transactionType?.toLowerCase()) {
      case 'ingreso':
        return 'success';
      default:
        return 'danger';
    }
  }

  getTransactionAccountIdSeverity(accountId: string): string {
    switch (accountId) {
      case null:
        return 'secondary';
      default:
        return 'success';
    }
  }
}