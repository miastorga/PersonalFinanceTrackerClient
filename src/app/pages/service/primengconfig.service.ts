// src/app/services/primeng-config.service.ts
import { Injectable } from '@angular/core';
import { PrimeNG } from 'primeng/config';

@Injectable({
  providedIn: 'root'
})
export class PrimengConfigService {

  // Traducciones globales
  private readonly translations = {
    // Filtros generales
    matchAll: 'Coincidir con todos',
    matchAny: 'Coincidir con cualquiera',
    addRule: 'Agregar regla',
    removeRule: 'Quitar regla',
    clear: 'Limpiar',
    apply: 'Aplicar',
    // Operadores de filtro
    startsWith: 'Empieza por',
    contains: 'Contiene',
    notContains: 'No contiene',
    endsWith: 'Termina por',
    equals: 'Igual a',
    notEquals: 'No igual a',
    noFilter: 'Sin filtro',
    // Para números
    lt: 'Menor que',
    lte: 'Menor o igual que',
    gt: 'Mayor que',
    gte: 'Mayor o igual que',
    // Para fechas
    dateIs: 'Es igual a',
    dateIsNot: 'No es igual a',
    dateBefore: 'Antes de',
    dateAfter: 'Después de',
    // Otros
    choose: 'Elegir',
    upload: 'Subir',
    cancel: 'Cancelar',
    reject: 'Rechazar',
    accept: 'Aceptar'
  };

  // Opciones de filtro reutilizables
  readonly textFilterOptions = [
    { label: 'Contiene', value: 'contains' },
    { label: 'No contiene', value: 'notContains' },
    { label: 'Empieza por', value: 'startsWith' },
    { label: 'Termina por', value: 'endsWith' },
    { label: 'Igual a', value: 'equals' },
    { label: 'No igual a', value: 'notEquals' }
  ];

  readonly numberFilterOptions = [
    { label: 'Igual a', value: 'equals' },
    { label: 'No igual a', value: 'notEquals' },
    { label: 'Mayor que', value: 'gt' },
    { label: 'Mayor o igual que', value: 'gte' },
    { label: 'Menor que', value: 'lt' },
    { label: 'Menor o igual que', value: 'lte' }
  ];

  readonly dateFilterOptions = [
    { label: 'Es igual a', value: 'dateIs' },
    { label: 'No es igual a', value: 'dateIsNot' },
    { label: 'Antes de', value: 'dateBefore' },
    { label: 'Después de', value: 'dateAfter' }
  ];

  constructor(private primengConfig: PrimeNG) {
    this.initializeTranslations();
  }

  /**
   * Inicializa las traducciones de PrimeNG
   */
  private initializeTranslations(): void {
    this.primengConfig.setTranslation(this.translations);
  }

  /**
   * Permite actualizar traducciones específicas si es necesario
   */
  updateTranslations(customTranslations: any): void {
    this.primengConfig.setTranslation({
      ...this.translations,
      ...customTranslations
    });
  }

  /**
   * Obtiene las traducciones actuales
   */
  getTranslations() {
    return { ...this.translations };
  }
}