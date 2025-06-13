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
    <div class="card">
      <p-toolbar styleClass="mb-6">
        <ng-template #start>
          <p-button 
            label="Nueva Transacción" 
            icon="pi pi-plus" 
            severity="primary" 
            class="mr-2" 
            (onClick)="showAddTransactionDialog()" />
            <p-button
            severity="danger"
            label="Eliminar Seleccionadas"
            icon="pi pi-trash"
            outlined
            (onClick)="deleteSelectedTransactions()"
            [disabled]="!selectedTransactions || selectedTransactions.length === 0" />
        </ng-template>

        <!-- <ng-template #end>
          <p-button 
            label="Exportar" 
            icon="pi pi-upload" 
            severity="secondary" 
            (onClick)="exportCSV()" />
        </ng-template> -->
      </p-toolbar>
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
            <h5 class="m-0">Gestión de Transacciones</h5>
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

        @if (paginationService.loading() == false) {
          <ng-template #emptymessage>
            <tr>
              <td colspan="8">No se encontraron transacciones.</td>
            </tr>
          </ng-template>
        }
      </p-table>

      <!-- SPINNER DE CARGA -->
      @if(paginationService.loading() == true){
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
                        [useGrouping]="false"
                        [minFractionDigits]="0"
                        [maxFractionDigits]="2"
                        placeholder="0"
                        class="w-full">
                      </p-inputNumber>
                      <small class="text-red-500" *ngIf="transactionForm.get('amount')?.invalid && transactionForm.get('amount')?.touched">
                        El monto es requerido
                      </small>
                    </div>

                    <!-- Descripción -->
                    <div class="field">
                      <label for="description" class="block text-sm font-medium mb-2">Descripción *</label>
                      <input
                        id="description"
                        type="text"
                        pInputText
                        formControlName="description"
                        placeholder="Ingrese una descripción"
                        class="w-full">
                      <small class="text-red-500" *ngIf="transactionForm.get('description')?.invalid && transactionForm.get('description')?.touched">
                        La descripción es requerida
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
      <div class="flex justify-between items-center mt-4 p-3 border-t">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">
            Mostrando {{ paginationService.getStartRecord() }} a {{ paginationService.getEndRecord() }} de {{ paginationService.paginationData().totalCount }} registros
          </span>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- Botón Primera Página -->
          <button
            pButton
            icon="pi pi-angle-double-left"
            class="p-button-text p-button-sm"
            [disabled]="!paginationService.paginationData().hasPreviousPage || paginationService.loading()"
            (click)="goToFirstPage()"
            pTooltip="Primera página">
          </button>

          <button
            pButton
            icon="pi pi-angle-left"
            class="p-button-text p-button-sm"
            [disabled]="!paginationService.paginationData().hasPreviousPage || paginationService.loading()"
            (click)="goToPreviousPage()"
            pTooltip="Página anterior">
          </button>

          <span class="text-sm font-medium text-gray-700 px-3">
                Página {{ paginationService.paginationData().currentPage }} de {{ paginationService.paginationData().totalPages }}
            </span>

          <button
            pButton
            icon="pi pi-angle-right"
            class="p-button-text p-button-sm"
            [disabled]="!paginationService.paginationData().hasNextPage || paginationService.loading()"
            (click)="goToNextPage()"
            pTooltip="Página siguiente">
          </button>

          <button
            pButton
            icon="pi pi-angle-double-right"
            class="p-button-text p-button-sm"
            [disabled]="!paginationService.paginationData().hasNextPage || paginationService.loading()"
            (click)="goToLastPage()"
            pTooltip="Última página">
          </button>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-sm">Filas por página:</label>
          <p-select 
            [options]="paginationService.rowsPerPageOptions"
            [(ngModel)]="currentPageSize"
            (onChange)="onRowsPerPageChange($event)"
            [style]="{'min-width': '80px'}"
            placeholder="5">
          </p-select>
        </div>
      </div>
    </div>
    <p-confirmdialog [style]="{ width: '450px' }" />
  `,
  styles: `
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


  loading: boolean = false;
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

  currentPageSize = 10;

  constructor() {
    this.initializeForm();
  }

  ngOnInit() {
    console.log('TRANSACTIONS CRUD INIT');
    this.paginationService.initialize(10);
    this.loadTransactions()
    this.loadCategories()
    this.loadAccounts()
  }

  initializeForm() {
    this.transactionForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1), Validators.max(1000000000)]],
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]],
      date: [new Date(), Validators.required],
      transactionType: ['', Validators.required],
      categoryName: ['', Validators.required],
      accountId: ['']
    });
  }

  loadTransactions() {
    this.loading = true;
    this.paginationService.loadData((page, pageSize) =>
      this.transactionService.getTransactions({ page, results: pageSize })
    );
    console.log('trans ' + this.paginationService.items())
  }

  getAccountName(transaction: Transaction) {
    return this.accountsSignal().find(a => a.accountId == transaction.accountId)?.accountName
  }

  loadCategories() {
    this.loading = true;
    this.categoriesService.getCategories().subscribe({
      next: (response: Category[]) => {
        console.log('categories data:', response);

        this.categoriesSignal.set(response)

        this.loading = false;
      },
      error: (error) => {
        console.error('Error getting transactions:', error);
        this.loading = false;
      }
    })
  }

  loadAccounts() {
    this.loading = true
    this.accountService.getAccounts().subscribe({
      next: (response: Account[]) => {
        console.log('accoutns data:', response);

        this.accountsSignal.set(response)

        this.loading = false;
      },
      error: (error) => {
        console.error('Error getting transactions:', error);
        this.loading = false;
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

    console.log(transaction)

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
    console.log('submit')
    if (this.transactionForm.valid) {
      this.savingTransaction = true;

      const formData = this.transactionForm.value;
      console.log(formData)
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
          console.log('editar')
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
              console.error('Error actualizando transacción:', error);
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
              console.error('Error creando transacción:', error);
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
    console.log('borrar  trans')
    console.log(transaction.transactionId)
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la transacción "${transaction.description}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.transactionService.removeTransaction(transaction.transactionId).subscribe({
          next: (response) => {
            console.log('Transacción creada:', response);
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
            console.error('Error creando transacción:', error);
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
    console.log(this.selectedTransactions)
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
            console.log('Todas las transacciones eliminadas:', responses);

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
            console.error('Error eliminando transacciones:', error);
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