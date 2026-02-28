import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CustomerService } from '../../services/customer.service';
import { SnackService } from '../../services/snack.service';
import { SaleService, PaymentDetail } from '../../services/sale.service';
import { PaymentMethodService } from '../../services/payment-method.service';
import { Customer } from '../../models/customer.model';
import { Snack } from '../../models/snack.model';
import { PaymentMethod } from '../../models/payment-method.model';
import { finalize, map, startWith, Observable } from 'rxjs';
import { SaleConfirmDialogComponent, SaleConfirmDialogData } from '../shared/sale-confirm-dialog.component';

interface PaymentEntry {
  paymentMethodId: string;
  amount: number;
}

interface ItemRow {
  snackControl: FormControl<string>;
  quantityControl: FormControl<number>;
  filteredSnacks$: Observable<Snack[]>;
  selectedSnack: Snack | null;
}

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    FormsModule,
  ],
  template: `
    <h2 mat-dialog-title>Nova Venda</h2>
    <mat-dialog-content>
      @if (loadingData()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <form [formGroup]="form">
          <div class="form-row">
            <mat-form-field class="date-field">
              <mat-label>Data da Venda</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="saleDate">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-hint>Padrão: data atual</mat-hint>
            </mat-form-field>
          </div>

          <mat-form-field class="full-width">
            <mat-label>Cliente</mat-label>
            <input matInput
                   type="text"
                   [formControl]="customerSearchControl"
                   [matAutocomplete]="customerAuto"
                   placeholder="Digite para pesquisar...">
            <mat-icon matSuffix>search</mat-icon>
            <mat-autocomplete #customerAuto="matAutocomplete"
                              [displayWith]="displayCustomer"
                              (optionSelected)="onCustomerSelected($event)">
              @for (customer of filteredCustomers$ | async; track customer.id) {
                <mat-option [value]="customer">
                  <span class="option-name">{{ customer.name }}</span>
                  @if (customer.whatsApp) {
                    <span class="option-detail">{{ customer.whatsApp }}</span>
                  }
                </mat-option>
              }
            </mat-autocomplete>
            @if (selectedCustomer()) {
              <mat-hint class="selected-hint">Selecionado: {{ selectedCustomer()?.name }}</mat-hint>
            }
          </mat-form-field>

          <div class="items-section">
            <div class="items-header">
              <h3>Itens</h3>
              <button mat-mini-fab color="primary" type="button" (click)="addItem()">
                <mat-icon>add</mat-icon>
              </button>
            </div>

            @for (item of itemRows(); track $index; let i = $index) {
              <div class="item-row">
                <mat-form-field class="snack-field">
                  <mat-label>Lanche</mat-label>
                  <input matInput
                         type="text"
                         [formControl]="item.snackControl"
                         [matAutocomplete]="snackAuto"
                         placeholder="Digite para pesquisar...">
                  <mat-icon matSuffix>search</mat-icon>
                  <mat-autocomplete #snackAuto="matAutocomplete"
                                    [displayWith]="displaySnack"
                                    (optionSelected)="onSnackSelected($event, i)">
                    @for (snack of item.filteredSnacks$ | async; track snack.id) {
                      <mat-option [value]="snack">
                        <span class="option-name">{{ snack.name }}</span>
                        <span class="option-price">{{ snack.price | currency:'BRL' }}</span>
                      </mat-option>
                    }
                  </mat-autocomplete>
                </mat-form-field>

                <mat-form-field class="quantity-field">
                  <mat-label>Qtd</mat-label>
                  <input matInput type="number" [formControl]="item.quantityControl" min="1">
                </mat-form-field>

                @if (item.selectedSnack) {
                  <span class="item-subtotal">
                    {{ (item.selectedSnack.price * item.quantityControl.value) | currency:'BRL' }}
                  </span>
                }

                <button mat-icon-button color="warn" type="button" (click)="removeItem(i)"
                        [disabled]="itemRows().length <= 1">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }
          </div>

          <div class="total-section">
            <div class="calculated-total">
              <span>Total calculado:</span>
              <span>{{ calculatedTotal() | currency:'BRL' }}</span>
            </div>
            <mat-form-field class="manual-total-field">
              <mat-label>Total manual (opcional)</mat-label>
              <input matInput type="number" [value]="manualTotalInput()" (input)="onManualTotalChange($event)" min="0" step="0.01">
              <span matTextSuffix>R$</span>
              <mat-hint>Deixe em branco para usar o total calculado</mat-hint>
            </mat-form-field>
            @if (hasDiscount()) {
              <div class="discount-indicator">
                Desconto: {{ discountPercentage() | number:'1.0-1' }}%
              </div>
            }
            <div class="final-total">
              <strong>Total final: {{ finalTotal() | currency:'BRL' }}</strong>
            </div>
          </div>

          <mat-checkbox formControlName="isPaid" (change)="onIsPaidChange()">Pago na hora</mat-checkbox>

          @if (form.value.isPaid) {
            <div class="payments-section">
              <div class="payments-header">
                <strong>Formas de Pagamento</strong>
                <button mat-icon-button color="primary" type="button" (click)="addPayment()"
                        [disabled]="payments().length >= activePaymentMethods().length">
                  <mat-icon>add</mat-icon>
                </button>
              </div>

              @for (payment of payments(); track $index) {
                <div class="payment-row">
                  <mat-form-field class="payment-method-field">
                    <mat-label>Forma</mat-label>
                    <mat-select [(ngModel)]="payment.paymentMethodId" [ngModelOptions]="{standalone: true}">
                      @for (method of activePaymentMethods(); track method.id) {
                        <mat-option [value]="method.id">{{ method.name }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field class="payment-amount-field">
                    <mat-label>Valor</mat-label>
                    <input matInput type="number" [(ngModel)]="payment.amount" [ngModelOptions]="{standalone: true}" min="0" step="0.01">
                    <span matTextPrefix>R$&nbsp;</span>
                  </mat-form-field>

                  @if (payments().length > 1) {
                    <button mat-icon-button color="warn" type="button" (click)="removePayment($index)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  }
                </div>
              }

              <div class="payment-summary" [class.error]="paymentDifference() !== 0">
                <div class="summary-row">
                  <span>Total Informado:</span>
                  <span>{{ paymentsTotal() | currency:'BRL' }}</span>
                </div>
                @if (paymentDifference() !== 0) {
                  <div class="summary-row difference">
                    <span>Diferença:</span>
                    <span>{{ paymentDifference() | currency:'BRL' }}</span>
                  </div>
                }
              </div>
            </div>
          }
        </form>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()" [disabled]="saving()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="save()"
              [disabled]="!canSave() || saving()">
        @if (saving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          Salvar
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
    .form-row {
      margin-bottom: 16px;
    }
    .date-field {
      width: 200px;
    }
    .full-width {
      width: 100%;
    }
    .items-section {
      margin: 20px 0;
    }
    .items-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .items-header h3 {
      margin: 0;
    }
    .item-row {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 10px;
    }
    .snack-field {
      flex: 1;
    }
    .quantity-field {
      width: 80px;
    }
    .item-subtotal {
      min-width: 90px;
      text-align: right;
      font-weight: 500;
      color: #00bcd4;
    }
    .total-section {
      margin: 20px 0;
      padding: 16px;
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }
    .calculated-total {
      display: flex;
      justify-content: space-between;
      color: #aaa;
      margin-bottom: 12px;
    }
    .manual-total-field {
      width: 100%;
      margin-bottom: 8px;
    }
    .discount-indicator {
      background-color: #4caf50;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      display: inline-block;
      margin-bottom: 8px;
    }
    .final-total {
      text-align: right;
      font-size: 18px;
    }
    .payments-section {
      margin-top: 20px;
      padding: 16px;
      background-color: rgba(0, 188, 212, 0.1);
      border-radius: 8px;
    }
    .payments-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .payment-row {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .payment-method-field {
      flex: 1;
    }
    .payment-amount-field {
      width: 140px;
    }
    .payment-summary {
      margin-top: 12px;
      padding: 8px;
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }
    .payment-summary.error {
      background-color: rgba(244, 67, 54, 0.2);
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin: 4px 0;
    }
    .summary-row.difference {
      color: #f44336;
      font-weight: 500;
    }
    .option-name {
      font-weight: 500;
    }
    .option-detail, .option-price {
      color: #aaa;
      font-size: 12px;
      margin-left: 8px;
    }
    .option-price {
      color: #4caf50;
    }
    .selected-hint {
      color: #4caf50;
    }
    mat-option {
      display: flex;
      justify-content: space-between;
    }
  `]
})
export class SaleFormComponent implements OnInit {
  form: FormGroup;
  customerSearchControl = new FormControl<string | Customer>('');
  filteredCustomers$!: Observable<Customer[]>;

  readonly customers = signal<Customer[]>([]);
  readonly snacks = signal<Snack[]>([]);
  readonly paymentMethods = signal<PaymentMethod[]>([]);
  readonly payments = signal<PaymentEntry[]>([]);
  readonly loadingData = signal(true);
  readonly saving = signal(false);
  readonly manualTotalInput = signal<string>('');
  readonly selectedCustomer = signal<Customer | null>(null);
  readonly itemRows = signal<ItemRow[]>([]);

  readonly activePaymentMethods = computed(() => {
    return this.paymentMethods().filter(pm => pm.active);
  });

  readonly paymentsTotal = computed(() => {
    return this.payments().reduce((sum, p) => sum + (p.amount || 0), 0);
  });

  readonly paymentDifference = computed(() => {
    return Math.round((this.finalTotal() - this.paymentsTotal()) * 100) / 100;
  });

  readonly calculatedTotal = computed(() => {
    return this.itemRows().reduce((total, item) => {
      if (item.selectedSnack) {
        return total + (item.selectedSnack.price * (item.quantityControl.value || 0));
      }
      return total;
    }, 0);
  });

  readonly finalTotal = computed(() => {
    const manualValue = this.manualTotalInput();
    const calculated = this.calculatedTotal();
    if (manualValue !== '' && !isNaN(parseFloat(manualValue))) {
      const manual = parseFloat(manualValue);
      return manual >= 0 ? manual : calculated;
    }
    return calculated;
  });

  readonly hasDiscount = computed(() => {
    return this.finalTotal() < this.calculatedTotal();
  });

  readonly discountPercentage = computed(() => {
    const calculated = this.calculatedTotal();
    if (calculated === 0) return 0;
    return ((calculated - this.finalTotal()) / calculated) * 100;
  });

  constructor(
    public dialogRef: MatDialogRef<SaleFormComponent>,
    private fb: FormBuilder,
    private customerService: CustomerService,
    private snackService: SnackService,
    private saleService: SaleService,
    private paymentMethodService: PaymentMethodService,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      saleDate: [new Date(), Validators.required],
      isPaid: [false]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount === 3) {
        this.loadingData.set(false);
        this.setupCustomerAutocomplete();
        this.addItem();
      }
    };

    this.customerService.getAll(1, 1000).subscribe({
      next: (result) => {
        this.customers.set(result.items.filter(c => c.active));
        checkLoaded();
      },
      error: () => checkLoaded()
    });

    this.snackService.getAll(1, 1000).subscribe({
      next: (result) => {
        this.snacks.set(result.items.filter(s => s.active));
        checkLoaded();
      },
      error: () => checkLoaded()
    });

    this.paymentMethodService.getAll(1, 1000).subscribe({
      next: (result) => {
        this.paymentMethods.set(result.items);
        checkLoaded();
      },
      error: () => checkLoaded()
    });
  }

  setupCustomerAutocomplete(): void {
    this.filteredCustomers$ = this.customerSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name || '';
        return this.filterCustomers(name);
      })
    );
  }

  filterCustomers(name: string): Customer[] {
    const filterValue = name.toLowerCase();
    return this.customers().filter(customer =>
      customer.name.toLowerCase().includes(filterValue)
    );
  }

  displayCustomer = (customer: Customer): string => {
    return customer?.name || '';
  };

  displaySnack = (snack: Snack): string => {
    return snack?.name || '';
  };

  onCustomerSelected(event: any): void {
    const customer = event.option.value as Customer;
    this.selectedCustomer.set(customer);
  }

  createSnackFilterObservable(control: FormControl<string>): Observable<Snack[]> {
    return control.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : '';
        return this.filterSnacks(name);
      })
    );
  }

  filterSnacks(name: string): Snack[] {
    const filterValue = name.toLowerCase();
    return this.snacks().filter(snack =>
      snack.name.toLowerCase().includes(filterValue)
    );
  }

  onSnackSelected(event: any, index: number): void {
    const snack = event.option.value as Snack;
    const rows = this.itemRows();
    if (rows[index]) {
      rows[index].selectedSnack = snack;
      this.itemRows.set([...rows]);
    }
  }

  addItem(): void {
    const snackControl = new FormControl<string>('', { nonNullable: true });
    const quantityControl = new FormControl<number>(1, { nonNullable: true });

    quantityControl.valueChanges.subscribe(() => {
      this.itemRows.set([...this.itemRows()]);
    });

    const newItem: ItemRow = {
      snackControl,
      quantityControl,
      filteredSnacks$: this.createSnackFilterObservable(snackControl),
      selectedSnack: null
    };

    this.itemRows.update(items => [...items, newItem]);
  }

  removeItem(index: number): void {
    this.itemRows.update(items => items.filter((_, i) => i !== index));
  }

  onManualTotalChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.manualTotalInput.set(input.value);
  }

  onIsPaidChange(): void {
    if (this.form.value.isPaid) {
      const activeMethods = this.activePaymentMethods();
      if (activeMethods.length > 0) {
        this.payments.set([{
          paymentMethodId: activeMethods[0].id!,
          amount: this.finalTotal()
        }]);
      }
    } else {
      this.payments.set([]);
    }
  }

  addPayment(): void {
    const availableMethod = this.activePaymentMethods().find(
      m => !this.payments().some(p => p.paymentMethodId === m.id)
    );

    if (availableMethod) {
      this.payments.update(payments => [
        ...payments,
        { paymentMethodId: availableMethod.id!, amount: 0 }
      ]);
    }
  }

  removePayment(index: number): void {
    this.payments.update(payments => payments.filter((_, i) => i !== index));
  }

  isPaymentsValid(): boolean {
    if (!this.form.value.isPaid) return true;
    const payments = this.payments();
    if (payments.length === 0) return false;
    if (this.paymentDifference() !== 0) return false;
    return payments.every(p => p.paymentMethodId && p.amount > 0);
  }

  canSave(): boolean {
    if (!this.selectedCustomer()) return false;
    const validItems = this.itemRows().filter(item => item.selectedSnack !== null);
    if (validItems.length === 0) return false;
    if (!this.isPaymentsValid()) return false;
    return true;
  }

  save(): void {
    if (!this.canSave()) return;

    const customer = this.selectedCustomer();
    const validItems = this.itemRows().filter(item => item.selectedSnack !== null);

    const confirmItems = validItems.map(item => ({
      snackName: item.selectedSnack!.name,
      quantity: item.quantityControl.value,
      unitPrice: item.selectedSnack!.price,
      subtotal: item.selectedSnack!.price * item.quantityControl.value
    }));

    const freshCalculatedTotal = confirmItems.reduce((sum, item) => sum + item.subtotal, 0);
    const manualValue = this.manualTotalInput();
    const freshFinalTotal = manualValue !== '' && !isNaN(parseFloat(manualValue)) && parseFloat(manualValue) >= 0
      ? parseFloat(manualValue)
      : freshCalculatedTotal;

    const dialogData: SaleConfirmDialogData = {
      customerName: customer?.name || 'Cliente',
      saleDate: this.form.value.saleDate,
      items: confirmItems,
      calculatedTotal: freshCalculatedTotal,
      finalTotal: freshFinalTotal,
      isPaid: this.form.value.isPaid
    };

    const confirmDialogRef = this.dialog.open(SaleConfirmDialogComponent, {
      width: '450px',
      data: dialogData
    });

    confirmDialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.executeSave();
      }
    });
  }

  private executeSave(): void {
    this.saving.set(true);

    const validItems = this.itemRows().filter(item => item.selectedSnack !== null);

    // Calcula o total SEM desconto (soma de preço * quantidade de cada item)
    const calculatedTotal = validItems.reduce((total, item) => {
      return total + (item.selectedSnack!.price * item.quantityControl.value);
    }, 0);

    // Pega o valor manual informado (se houver)
    const manualValue = this.manualTotalInput();
    let finalTotal = calculatedTotal;
    if (manualValue !== '' && !isNaN(parseFloat(manualValue))) {
      const manual = parseFloat(manualValue);
      if (manual >= 0) {
        finalTotal = manual;
      }
    }

    // Calcula o desconto total
    const totalDiscount = calculatedTotal - finalTotal;

    const sale = {
      customerId: this.selectedCustomer()!.id,
      saleDate: this.form.value.saleDate?.toISOString(),
      isPaid: this.form.value.isPaid,
      items: validItems.map(item => {
        const unitPrice = item.selectedSnack!.price;
        const quantity = item.quantityControl.value;
        const subTotal = unitPrice * quantity;

        // Calcula o desconto proporcional para este item
        let itemDiscount = 0;
        let itemTotalAmount = subTotal;

        if (totalDiscount > 0 && calculatedTotal > 0) {
          // Distribui o desconto proporcionalmente ao valor de cada item
          itemDiscount = Math.round((subTotal / calculatedTotal) * totalDiscount * 100) / 100;
          itemTotalAmount = Math.round((subTotal - itemDiscount) * 100) / 100;
        }

        return {
          snackId: item.selectedSnack!.id,
          quantity: quantity,
          unitPrice: unitPrice,        // Preço original do cadastro
          discount: itemDiscount,       // Desconto aplicado
          totalAmount: itemTotalAmount  // Valor final (subTotal - desconto)
        };
      })
    };

    const paymentsToSend: PaymentDetail[] | undefined = this.form.value.isPaid
      ? this.payments().map(p => ({ paymentMethodId: p.paymentMethodId, amount: p.amount }))
      : undefined;

    // Debug: verificar valores enviados
    console.log('=== DEBUG VENDA ===');
    console.log('calculatedTotal (sem desconto):', calculatedTotal);
    console.log('finalTotal (com desconto):', finalTotal);
    console.log('totalDiscount:', totalDiscount);
    console.log('sale:', JSON.stringify(sale, null, 2));
    console.log('===================');

    this.saleService.create(sale, paymentsToSend)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: () => {
          // Handle error if needed
        }
      });
  }
}
