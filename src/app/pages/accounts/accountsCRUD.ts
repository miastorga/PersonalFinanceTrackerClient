import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, ValueChangeEvent } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { forkJoin } from 'rxjs';
import { Account, AccountsService, CreateAccount } from '../service/accounts.service';
import { PrimengConfigService } from '../service/primengconfig.service';

@Component({
  selector: 'app-accounts-crud',
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
    InputTextModule,
    DialogModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    TooltipModule,
    InputNumberModule,
    SelectModule,
    TagModule
  ],
  template: `
  <div class="header-section p-4 mb-4 surface-card border-round shadow-2" style="background: var(--surface-card); border: 1px solid var(--surface-border);">
    <div class="header-content flex justify-content-between align-items-center mb-3">
      <h1 class="title text-color m-0 flex align-items-center">
        <i class="pi pi-wallet text-primary mr-3" style="font-size: 1.5rem; vertical-align: middle;"></i>
        Gestión de Cuentas
      </h1>
      <div class="flex gap-2 ml-auto">
        <p-button
          label="Nueva Cuenta"
          icon="pi pi-plus"
          (click)="showAddAccountDialog()"
          severity="success"
          class="p-button-raised">
        </p-button>
        <p-button
          severity="danger"
          label="Eliminar Seleccionadas"
          icon="pi pi-trash"
          outlined
          (onClick)="deleteSelectedAccounts()"
          [disabled]="!selectedAccounts || selectedAccounts.length === 0">
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
      [value]="accountsSignal()"
      dataKey="accountId" 
      selectionMode="multiple"  
      [showCurrentPageReport]="false"
      [paginator]="false"
      [rowHover]="true"
      [showGridlines]="true"
      [globalFilterFields]="['accountName', 'accountType', 'currentBalance', 'initialBalance']"
      responsiveLayout="scroll"
      [(selection)]="selectedAccounts"
      [tableStyle]="{ 'min-width': '75rem' }"
      [sortField]="'accountName'"
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
              <input pInputText type="text" (input)="onGlobalFilter(dt1, $event)" placeholder="Buscar cuentas..." />
            </p-iconfield> -->
          </div>
        </div>
      </ng-template>

      <ng-template #header>
        <tr>
          <th style="width: 3rem">
            <p-tableHeaderCheckbox />
          </th>
          <th style="min-width: 12rem" pSortableColumn="accountId">
            <div class="flex justify-between items-center">
              ID
              <p-columnFilter 
                type="text" 
                field="accountId" 
                display="menu" 
                placeholder="Buscar por ID"
                [matchModeOptions]="primengConfig.textFilterOptions">
              </p-columnFilter>
              <p-sortIcon field="accountId"></p-sortIcon>
            </div>
          </th>
          <th style="min-width: 15rem" pSortableColumn="accountName">
            <div class="flex justify-between items-center">
              Nombre
              <p-columnFilter 
                type="text" 
                field="accountName" 
                display="menu" 
                placeholder="Buscar por nombre"
                [matchModeOptions]="primengConfig.textFilterOptions">
              </p-columnFilter>
              <p-sortIcon field="accountName"></p-sortIcon>
            </div>
          </th>
          <th style="min-width: 12rem" pSortableColumn="accountType">
            <div class="flex justify-between items-center">
              Tipo
              <p-columnFilter 
                type="text" 
                field="accountType" 
                display="menu" 
                placeholder="Buscar por tipo"
                [matchModeOptions]="primengConfig.textFilterOptions">
              </p-columnFilter>
              <p-sortIcon field="accountType"></p-sortIcon>
            </div>
          </th>
          <th style="min-width: 12rem">
            Saldo Inicial
          </th>
          <th style="min-width: 12rem" pSortableColumn="currentBalance">
            <div class="flex justify-between items-center">
              Saldo Actual
              <p-columnFilter 
                type="numeric" 
                field="currentBalance" 
                display="menu" 
                placeholder="Buscar por saldo actual"
                [matchModeOptions]="primengConfig.numberFilterOptions">
              </p-columnFilter>
              <p-sortIcon field="currentBalance"></p-sortIcon>
            </div>
          </th>
          <th style="min-width: 12rem">Acciones</th>
        </tr>
      </ng-template>

      <ng-template #body let-account>
        <tr>
          <td style="width: 3rem">
            <p-tableCheckbox [value]="account" />
          </td>
          <td>
            <div class="flex items-center gap-2">
              <span>{{ account.accountId.slice(0,8) }}...</span>
            </div>
          </td>
          <td>
            <div class="flex items-center gap-2">
              <span>{{ account.accountName }}</span>
            </div>
          </td>
          <td>
            <p-tag 
              [value]="account.accountType" 
              [severity]="getAccountTypeSeverity(account.accountType)"
              >
            </p-tag>
          </td>
          <td>
            <!-- <span [class]="getBalanceClass(account.initialBalance)"> -->
              {{ account.initialBalance |  currency:'USD':'symbol':'1.0-0' }}
            <!-- </span> -->
          </td>
          <td>
            <!-- <span [class]="getBalanceClass(account.currentBalance)"> -->
              {{ account.currentBalance |  currency:'USD':'symbol':'1.0-0' }}
            <!-- </span> -->
          </td>
          <td>
            <p-button 
              icon="pi pi-pencil" 
              class="mr-2" 
              [rounded]="true" 
              [outlined]="true" 
              (click)="editAccount(account)" 
              pTooltip="Editar cuenta"/>
            <p-button 
              icon="pi pi-trash" 
              severity="danger" 
              [rounded]="true" 
              [outlined]="true" 
              (click)="deleteAccount(account)"
              pTooltip="Eliminar cuenta" />
          </td>
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td colspan="7" class="text-center py-12">
            <div *ngIf="accountsSignal().length === 0 && loading == false"
              class="empty-state text-center surface-card border-round shadow-1 p-6">
                <i class="pi pi-wallet text-8xl text-color-secondary mb-4 block" style="font-size: 40px;"></i>
                <h3 class="text-color font-bold mb-2">No hay cuentas registradas</h3>
                <p class="text-color-secondary mb-4 line-height-3">
                  Crea tu primera cuenta para comenzar a gestionar tus finanzas personales
                </p>
                <p-button
                  label="Nueva Cuenta"
                  icon="pi pi-plus"
                  [outlined]="true"
                  severity="success"
                  (click)="showAddAccountDialog()">
                </p-button>
            </div>
          </td>
        </tr>
      </ng-template>

    </p-table>

    <!-- SPINNER DE CARGA -->
    @if(loading == true){
      <div class="flex justify-center items-center py-8">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #6366f1;"></i>
      </div>
    }

    <!-- MODAL PARA AGREGAR/EDITAR CUENTA -->
    <p-dialog
      [header]="editMode ? 'Editar Cuenta' : 'Nueva Cuenta'"
      [(visible)]="displayAddAccountDialog"
      [modal]="true"
      [style]="{width: '500px'}"
      [draggable]="false"
      [resizable]="false"
      [closable]="true">

      <ng-template #content>
        <form [formGroup]="accountForm" (ngSubmit)="onSubmitAccount()">
          <div class="grid grid-cols-1 gap-4">
            
            <!-- Nombre de Cuenta -->
            <div class="field">
              <label for="accountName" class="block text-sm font-medium mb-2">Nombre de Cuenta *</label>
              <input
                id="accountName"
                type="text"
                pInputText
                formControlName="accountName"
                placeholder="Ingrese el nombre de la cuenta"
                class="w-full"
                [maxlength]="100">
              <small class="text-red-500" *ngIf="accountForm.get('accountName')?.invalid && accountForm.get('accountName')?.touched">
                {{getNameErrorMessage()}} 
              </small>
            </div>

            <!-- Tipo de Cuenta -->
            <div class="field">
              <label for="accountType" class="block text-sm font-medium mb-2">Tipo de Cuenta *</label>
              <p-select
                id="accountType"
                formControlName="accountType"
                [options]="accountTypeOptions"
                placeholder="Seleccione el tipo de cuenta"
                optionLabel="label"
                optionValue="value"
                class="w-full"
                [appendTo]="'body'">
              </p-select>
              <small class="text-red-500" *ngIf="accountForm.get('accountType')?.invalid && accountForm.get('accountType')?.touched">
                El tipo de cuenta es requerido
              </small>
            </div>


            <!-- Saldo Actual -->
            <div class="field">
              <label for="currentBalance" class="block text-sm font-medium mb-2">Saldo Actual *</label>
              <p-inputNumber
                id="currentBalance"
                formControlName="currentBalance"
                mode="decimal"
                [useGrouping]="true"
                placeholder="0.00"
                prefix="$"
                class="w-full">
              </p-inputNumber>
              <small class="text-red-500" *ngIf="accountForm.get('currentBalance')?.invalid && accountForm.get('currentBalance')?.touched">
                <span *ngIf="accountForm.get('currentBalance')?.errors?.['required']">
                  El saldo actual es requerido
                </span>
              </small>
            </div>


            <!-- Saldo Inicial -->
            <div class="field">
              <label for="initialBalance" class="block text-sm font-medium mb-2">
                Saldo Inicial *
                <span class="text-xs text-gray-500 ml-1">(Solo lectura)</span>
              </label>
              <p-inputNumber
                id="initialBalance"
                formControlName="initialBalance"
                [useGrouping]="true"
                placeholder="0.00"
                prefix="$"
                class="w-full"
                [readonly]="true"
                [disabled]="true">
              </p-inputNumber>
              <small class="text-red-500" *ngIf="accountForm.get('initialBalance')?.invalid && accountForm.get('initialBalance')?.touched && !editMode">
                <span *ngIf="accountForm.get('initialBalance')?.errors?.['required']">
                  El saldo inicial es requerido
                </span>
                <span *ngIf="accountForm.get('initialBalance')?.errors?.['min']">
                  El saldo inicial no puede ser negativo
                </span>
              </small>
                <small class="text-blue-600">
                  <i class="pi pi-info-circle mr-1"></i>
                  El saldo inicial no se puede modificar después de la creación
                </small>
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
            (click)="hideAddAccountDialog()">
          </button>
          <button
            pButton
            [label]="editMode ? 'Actualizar' : 'Guardar'"
            icon="pi pi-check"
            class="p-button-success"
            [disabled]="accountForm.invalid || savingAccount"
            [loading]="savingAccount"
            (click)="onSubmitAccount()">
          </button>
        </div>
      </ng-template>
    </p-dialog>

    <div class="flex justify-between items-center mt-4 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
          <i class="pi pi-tags text-gray-500 dark:text-gray-400"></i>
          <span class="text-sm text-gray-600 dark:text-gray-300">
            Total de cuentas:
            <span class="font-medium text-gray-800 dark:text-gray-200">{{ accountsSignal().length }}</span>
          </span>
        </div>
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
      border: 1px solid var(--surface-border);
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

    .field {
      margin-bottom: 1rem;
    }

    .p-button.p-button-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }

    .positive-balance {
      color: #10b981;
      font-weight: 600;
    }

    .negative-balance {
      color: #ef4444;
      font-weight: 600;
    }

    .zero-balance {
      color: #6b7280;
      font-weight: 600;
    }
  `,
  providers: [ConfirmationService, MessageService]
})
export class AccountsCRUD implements OnInit {
  // Servicios inyectados
  fb = inject(FormBuilder);
  messageService = inject(MessageService);
  accountsService = inject(AccountsService);
  confirmationService = inject(ConfirmationService);
  primengConfig = inject(PrimengConfigService);

  loading: boolean = false;
  editMode: boolean = false;
  currentAccountId: string | null = null;

  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('dt1') dt1!: Table;

  // Signal para las cuentas
  accountsSignal = signal<Account[]>([]);

  // Variables para el formulario y modal
  displayAddAccountDialog = false;
  accountForm!: FormGroup;
  savingAccount = false;
  selectedAccounts!: Account[] | null;

  accountTypeOptions = [
    // { label: 'Cuenta Corriente', value: 'Cuenta Corriente' },
    { label: 'Cuenta de Ahorro', value: 'Cuenta de Ahorro' },
    { label: 'Tarjeta de Crédito', value: 'Tarjeta de Crédito' },
    { label: 'Efectivo', value: 'Efectivo' },
    { label: 'Inversión', value: 'Inversión' },
    { label: 'Préstamo', value: 'Préstamo' },
    { label: 'Cuenta Vista', value: 'Cuenta Vista' },
    { label: 'Deuda', value: 'Deuda' }
  ];

  constructor() {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadAccounts();
  }

  initializeForm() {
    this.accountForm = this.fb.group({
      accountName: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      accountType: ['', Validators.required],
      initialBalance: [0, [
        Validators.required,
        Validators.min(0)
      ]],
      currentBalance: [0, Validators.required]
    });

    this.accountForm.get('currentBalance')?.valueChanges.subscribe(currentValue => {
      if (!this.editMode && currentValue !== null && currentValue !== undefined) {
        this.accountForm.get('initialBalance')?.setValue(currentValue, { emitEvent: false });
      }
    });
  }

  getNameErrorMessage(): string {
    const control = this.accountForm.get('accountName');

    if (control?.errors?.['required']) {
      return 'La cuenta es requerida';
    }
    if (control?.errors?.['minlength']) {
      return 'La cuenta debe tener al menos 3 caracteres';
    }
    if (control?.errors?.['maxlength']) {
      return 'La cuenta no puede superar los 100 caracteres';
    }

    return '';
  }


  loadAccounts() {
    this.loading = true;
    this.accountsService.getAccounts().subscribe({
      next: (response: Account[]) => {
        this.accountsSignal.set(response);
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Error al cargar las cuentas: ${error.message.toLowerCase() || 'Error desconocido'}`
        });
        this.loading = false;
      }
    });
  }

  // Métodos para el modal
  showAddAccountDialog() {
    this.editMode = false;
    this.currentAccountId = null;
    this.displayAddAccountDialog = true;
    this.resetForm();

    this.accountForm.patchValue({
      initialBalance: 0,
      currentBalance: 0
    });
  }

  editAccount(account: Account) {
    this.editMode = true;
    this.currentAccountId = account.accountId || null;
    this.displayAddAccountDialog = true;

    this.accountForm.patchValue({
      accountName: account.accountName,
      accountType: account.accountType, // Convertir aquí 
      initialBalance: account.initialBalance,
      currentBalance: account.currentBalance
    });
  }

  hideAddAccountDialog() {
    this.displayAddAccountDialog = false;
    this.resetForm();
  }

  resetForm() {
    this.accountForm.reset();
    this.accountForm.patchValue({
      initialBalance: 0,
      currentBalance: 0
    });
    this.savingAccount = false;
  }

  // Cuenta corriente no funciona
  onSubmitAccount() {
    if (this.accountForm.valid) {
      this.savingAccount = true;

      const formData = this.accountForm.value;
      if (!this.editMode) {
        const accountData: CreateAccount = {
          accountName: formData.accountName.trim(),
          accountType: formData.accountType,
          initialBalance: Number(formData.initialBalance),
          currentBalance: Number(formData.currentBalance)
        };
        console.log('CREATE - Data to send:', accountData);

        this.accountsService.createAccounts(accountData).subscribe({
          next: (response: Account) => {
            this.loadAccounts();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Cuenta creada exitosamente'
            });
            this.hideAddAccountDialog();
            this.savingAccount = false;
          },
          error: (error) => {
            console.error('Error creando cuenta:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Error al crear la cuenta: ${error.message}`
            });
            this.savingAccount = false;
          }
        });
      } else {
        // Para actualizar cuenta existente - SIN incluir initialBalance
        const accountData = {
          accountName: formData.accountName.trim(),
          accountType: formData.accountType,
          currentBalance: Number(formData.currentBalance),
          initialBalance: Number(formData.initialBalance)
        };

        this.accountsService.updateAccount(this.currentAccountId!, accountData).subscribe({
          next: (response: Account) => {
            this.loadAccounts();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Cuenta actualizada exitosamente'
            });
            this.hideAddAccountDialog();
            this.savingAccount = false;
          },
          error: (error) => {
            console.error('Error actualizando cuenta:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Error al actualizar la cuenta: ${error.message}`
            });
            this.savingAccount = false;
          }
        });
      }
    } else {
      Object.keys(this.accountForm.controls).forEach(key => {
        this.accountForm.get(key)?.markAsTouched();
      });

      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos requeridos'
      });
    }
  }

  // Métodos para eliminar cuentas
  deleteAccount(account: Account) {
    console.log('Delete account:', account.accountId);
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la cuenta "${account.accountName}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.accountsService.removeAccount(account.accountId).subscribe({
          next: (response) => {
            console.log('Cuenta eliminada:', response);
            this.loadAccounts();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Cuenta eliminada exitosamente'
            });
          },
          error: (error) => {
            console.error('Error eliminando cuenta:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Error al eliminar la cuenta: ${error.message}`
            });
          }
        });
      }
    });
  }

  deleteSelectedAccounts() {
    console.log('Delete selected accounts:', this.selectedAccounts);
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar las cuentas seleccionadas?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deleteObservables = this.selectedAccounts?.map(account =>
          this.accountsService.removeAccount(account.accountId)
        );

        forkJoin(deleteObservables!).subscribe({
          next: (responses) => {
            console.log('Todas las cuentas eliminadas:', responses);
            this.loadAccounts();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `${this.selectedAccounts?.length} cuentas eliminadas exitosamente`
            });
            this.selectedAccounts = [];
          },
          error: (error) => {
            console.error('Error eliminando cuentas:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Error al eliminar algunas cuentas: ${error.message}`
            });
            this.selectedAccounts = [];
            this.loadAccounts();
          }
        });
      }
    });
  }

  // Métodos de utilidad
  clear(table: Table) {
    table.clear();
    if (this.filter?.nativeElement) {
      this.filter.nativeElement.value = '';
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    const target = event.target as HTMLInputElement;
    table.filterGlobal(target.value, 'contains');
  }

  getAccountTypeSeverity(type: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (type?.toLowerCase()) {
      case 'inversión':
        return 'success';
      case 'cuenta de ahorro':
        return 'info';
      case 'tarjeta de crédito':
        return 'warning';
      case 'efectivo':
      case 'prestámo':
      case 'deuda':
        return 'danger';
      case 'cuenta vista':
      case 'vista':
        return 'secondary';
      default:
        return 'contrast';
    }
  }

  // getBalanceClass(balance: number): string {
  //   if (balance > 0) return 'positive-balance';
  //   if (balance < 0) return 'negative-balance';
  //   return 'zero-balance';
  // }
}