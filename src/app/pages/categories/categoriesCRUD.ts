import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { forkJoin } from 'rxjs';
import { CategoriesService, Category } from '../service/categories.service';
import { PrimengConfigService } from '../service/primengconfig.service';

export interface CreateCategory {
  categoryName: string;
}

@Component({
  selector: 'app-categories-crud',
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
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  template: `
    <div class="card">
      <p-toolbar styleClass="mb-6">
        <ng-template #start>
          <p-button 
            label="Nueva Categoría" 
            icon="pi pi-plus" 
            severity="primary" 
            class="mr-2" 
            (onClick)="showAddCategoryDialog()" />
          <p-button
            severity="danger"
            label="Eliminar Seleccionadas"
            icon="pi pi-trash"
            outlined
            (onClick)="deleteSelectedCategories()"
            [disabled]="!selectedCategories || selectedCategories.length === 0" />
        </ng-template>
      </p-toolbar>

      <p-toast
        position="top-right"
        [baseZIndex]="5000"
        [breakpoints]="{'960px': {width: '100%', right: '0', left: '0'}}">
      </p-toast>

      <p-table
        #dt1
        [value]="categoriesSignal()"
        dataKey="categoryId" 
        selectionMode="multiple"  
        [showCurrentPageReport]="false"
        [paginator]="false"
        [rowHover]="true"
        [showGridlines]="true"
        [globalFilterFields]="['categoryId', 'categoryName']"
        responsiveLayout="scroll"
        [(selection)]="selectedCategories"
        [tableStyle]="{ 'min-width': '50rem' }"
        [sortField]="'categoryName'"
        [sortOrder]="1"
      >
        <ng-template #caption>
          <div class="flex justify-between items-center flex-column sm:flex-row">
            <h5 class="m-0">Gestión de Categorías</h5>
            <div class="flex gap-2">
              <button pButton label="Limpiar" class="p-button-outlined mb-2" icon="pi pi-filter-slash" (click)="clear(dt1)"></button>
              <p-iconfield iconPosition="left" class="ml-auto">
                <!-- <p-inputicon>
                  <i class="pi pi-search"></i>
                </p-inputicon>
                <input pInputText type="text" (input)="onGlobalFilter(dt1, $event)" placeholder="Buscar categorías..." /> -->
              </p-iconfield>
            </div>
          </div>
        </ng-template>

        <ng-template #header>
          <tr>
            <th style="width: 3rem">
              <p-tableHeaderCheckbox />
            </th>
            <th style="min-width: 15rem" >
              <div class="flex justify-between items-center">
                Id
              </div>
            </th>
            <th style="min-width: 20rem" pSortableColumn="categoryName">
              <div class="flex justify-between items-center">
                Nombre de Categoría
                <p-columnFilter 
                  type="text" 
                  field="categoryName" 
                  display="menu" 
                  placeholder="Buscar por nombre"
                  [matchModeOptions]="primengConfig.textFilterOptions">
                </p-columnFilter>
                <p-sortIcon field="categoryName"></p-sortIcon>
              </div>
            </th>
            <th style="min-width: 12rem">Acciones</th>
          </tr>
        </ng-template>

        <ng-template #body let-category>
          <tr>
            <td style="width: 3rem">
              <p-tableCheckbox [value]="category" />
            </td>
            <td>
              <div class="flex items-center gap-2">
                <span>{{ category.categoryId.slice(0,6) }}...</span>
              </div>
            </td>
            <td>
              <div class="flex items-center gap-2">
                <span>{{ category.categoryName }}</span>
              </div>
            </td>
            <td>
              <p-button 
                icon="pi pi-pencil" 
                class="mr-2" 
                [rounded]="true" 
                [outlined]="true" 
                (click)="editCategory(category)" />
              <p-button 
                icon="pi pi-trash" 
                severity="danger" 
                [rounded]="true" 
                [outlined]="true" 
                (click)="deleteCategory(category)" />
            </td>
          </tr>
        </ng-template>

        @if (loading == false) {
          <ng-template #emptymessage>
            <tr>
              <td colspan="4">No se encontraron categorías.</td>
            </tr>
          </ng-template>
        }
      </p-table>

      <!-- SPINNER DE CARGA -->
      @if(loading == true){
        <div class="flex justify-center items-center py-8">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #6366f1;"></i>
        </div>
      }

      <!-- MODAL PARA AGREGAR/EDITAR CATEGORÍA -->
      <p-dialog
        [header]="editMode ? 'Editar Categoría' : 'Nueva Categoría'"
        [(visible)]="displayAddCategoryDialog"
        [modal]="true"
        [style]="{width: '450px'}"
        [draggable]="false"
        [resizable]="false"
        [closable]="true">

        <ng-template #content>
          <form [formGroup]="categoryForm" (ngSubmit)="onSubmitCategory()">
            <div class="grid grid-cols-1 gap-4">

              <!-- Nombre de Categoría -->
              <div class="field">
                <label for="categoryName" class="block text-sm font-medium mb-2">Nombre de Categoría *</label>
                <input
                  id="categoryName"
                  type="text"
                  pInputText
                  formControlName="categoryName"
                  placeholder="Ingrese el nombre de la categoría"
                  class="w-full">
                <small class="text-red-500" *ngIf="categoryForm.get('categoryName')?.invalid && categoryForm.get('categoryName')?.touched">
                  El nombre de la categoría es requerido
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
              (click)="hideAddCategoryDialog()">
            </button>
            <button
              pButton
              [label]="editMode ? 'Actualizar' : 'Guardar'"
              icon="pi pi-check"
              class="p-button-success"
              [disabled]="categoryForm.invalid || savingCategory"
              [loading]="savingCategory"
              (click)="onSubmitCategory()">
            </button>
          </div>
        </ng-template>
      </p-dialog>

      <!-- Información de registros -->
      <div class="flex justify-between items-center mt-4 p-3 border-t">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">
            Total de categorías: {{ categoriesSignal().length }}
          </span>
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
  `,
  providers: [ConfirmationService, MessageService]
})
export class CategoriesCRUD implements OnInit {
  // Servicios inyectados
  fb = inject(FormBuilder);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  categoriesService = inject(CategoriesService);
  primengConfig = inject(PrimengConfigService);

  loading: boolean = false;
  editMode: boolean = false;
  currentCategoryId: string | null = null;

  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('dt1') dt1!: Table;

  // Signal para categorías
  categoriesSignal = signal<Category[]>([]);

  // Variables para el formulario y modal
  displayAddCategoryDialog = false;
  categoryForm!: FormGroup;
  savingCategory = false;
  selectedCategories!: Category[] | null;

  constructor() {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadCategories();
  }

  initializeForm() {
    this.categoryForm = this.fb.group({
      categoryName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]]
    });
  }

  loadCategories() {
    this.loading = true;
    this.categoriesService.getCategories().subscribe({
      next: (response: Category[]) => {
        this.categoriesSignal.set(response);
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las categorías'
        });
        this.loading = false;
      }
    });
  }

  // Métodos para el modal
  showAddCategoryDialog() {
    this.editMode = false;
    this.currentCategoryId = null;
    this.displayAddCategoryDialog = true;
    this.resetForm();
  }

  editCategory(category: Category) {
    this.editMode = true;
    this.currentCategoryId = category.categoryId || null;
    this.displayAddCategoryDialog = true;

    this.categoryForm.patchValue({
      categoryName: category.categoryName
    });
  }

  hideAddCategoryDialog() {
    this.displayAddCategoryDialog = false;
    this.resetForm();
  }

  resetForm() {
    this.categoryForm.reset();
    this.savingCategory = false;
  }

  onSubmitCategory() {
    if (this.categoryForm.valid) {
      this.savingCategory = true;

      const formData = this.categoryForm.value;
      const categoryData: CreateCategory = {
        categoryName: formData.categoryName
      };

      try {
        if (this.editMode) {
          // Asumiendo que tienes un método updateCategory en tu servicio
          this.categoriesService.updateCategory(this.currentCategoryId!, categoryData).subscribe({
            next: (response) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Categoría actualizada exitosamente'
              });
              this.hideAddCategoryDialog();
              this.loadCategories();
              this.savingCategory = false;
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `Error al actualizar la categoría: ${error.message}`
              });
              this.savingCategory = false;
            }
          });
        } else {
          // Asumiendo que tienes un método createCategory en tu servicio
          this.categoriesService.createCategory(categoryData).subscribe({
            next: (response) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Categoría creada exitosamente'
              });
              setTimeout(() => {
                this.hideAddCategoryDialog();
                this.loadCategories();
              }, 1000);
              this.savingCategory = false;
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `Error al crear la categoría: ${error.message}`
              });
              this.savingCategory = false;
            }
          });
        }
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.editMode ? 'Error al actualizar la categoría' : 'Error al crear la categoría'
        });
        this.savingCategory = false;
      }
    } else {
      Object.keys(this.categoryForm.controls).forEach(key => {
        this.categoryForm.get(key)?.markAsTouched();
      });

      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos requeridos'
      });
    }
  }

  // Métodos para eliminar categorías
  deleteCategory(category: Category) {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la categoría "${category.categoryName}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Asumiendo que tienes un método removeCategory en tu servicio
        this.categoriesService.removeCategory(category.categoryId).subscribe({
          next: (response) => {
            this.loadCategories();
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Categoría eliminada exitosamente'
            });
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Error al eliminar la categoría: Comprueba que no exista ninguna transacción con esta categoria`
            });
          }
        });
      }
    });
  }

  deleteSelectedCategories() {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar las categorías seleccionadas?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deleteObservables = this.selectedCategories?.map(category =>
          this.categoriesService.removeCategory(category.categoryId)
        );

        forkJoin(deleteObservables!).subscribe({
          next: (responses) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `${this.selectedCategories?.length} categorías eliminadas exitosamente`
            });
            this.selectedCategories = [];
            this.loadCategories();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Error al eliminar algunas categorías: ${error.message}`
            });
            this.selectedCategories = [];
            this.loadCategories();
          }
        });
      }
    });
  }

  // Método para filtro global
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    if (this.filter?.nativeElement) {
      this.filter.nativeElement.value = '';
    }
  }
}