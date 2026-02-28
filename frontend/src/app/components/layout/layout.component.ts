import { Component, OnInit, OnDestroy, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AuthService } from '../../services/auth.service';
import { SaleService } from '../../services/sale.service';
import { SaleFormComponent } from '../sales/sale-form.component';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatTooltipModule,
    MatDialogModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav [mode]="isMobile() ? 'over' : 'side'" [opened]="!isMobile()" class="sidenav">
        <div class="logo">
          <h2>Fome Zero</h2>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active" (click)="onNavClick()">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/customers" routerLinkActive="active" (click)="onNavClick()">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Clientes</span>
          </a>
          <a mat-list-item routerLink="/snacks" routerLinkActive="active" (click)="onNavClick()">
            <mat-icon matListItemIcon>lunch_dining</mat-icon>
            <span matListItemTitle>Lanches</span>
          </a>
          <a mat-list-item routerLink="/sales" routerLinkActive="active" (click)="onNavClick()">
            <mat-icon matListItemIcon>point_of_sale</mat-icon>
            <span matListItemTitle>Vendas</span>
          </a>
          <a mat-list-item routerLink="/accounts-receivable" routerLinkActive="active" (click)="onNavClick()">
            <mat-icon matListItemIcon>request_quote</mat-icon>
            <span matListItemTitle>Contas a Receber</span>
          </a>
          <a mat-list-item routerLink="/payment-methods" routerLinkActive="active" (click)="onNavClick()">
            <mat-icon matListItemIcon>payment</mat-icon>
            <span matListItemTitle>Formas de Pagamento</span>
          </a>
          <a mat-list-item routerLink="/users" routerLinkActive="active" (click)="onNavClick()">
            <mat-icon matListItemIcon>manage_accounts</mat-icon>
            <span matListItemTitle>Usuários</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="spacer"></span>
          <span class="user-name">{{ userName }}</span>
          <button mat-icon-button (click)="logout()">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>

        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>

    <button mat-fab color="primary" class="new-sale-fab" (click)="openNewSale()" matTooltip="Nova Venda" matTooltipPosition="left">
      <mat-icon>add_shopping_cart</mat-icon>
    </button>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
      background-color: #121212;
    }
    .sidenav {
      width: 250px;
      background-color: #1e1e1e !important;
      border-right: 1px solid #333;
    }
    .logo {
      padding: 20px;
      text-align: center;
      border-bottom: 1px solid #333;
    }
    .logo h2 {
      margin: 0;
      color: #00bcd4;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .user-name {
      margin-right: 16px;
      color: #00bcd4;
    }
    .content {
      padding: 20px;
      background-color: #121212;
    }
    .new-sale-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
    }
    .active {
      background-color: rgba(0, 188, 212, 0.15) !important;
    }
    mat-nav-list a {
      color: #fff !important;
    }
    mat-nav-list a:hover {
      background-color: rgba(0, 188, 212, 0.1) !important;
    }
  `]
})
export class LayoutComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  userName: string = '';
  readonly isMobile = signal(false);

  private breakpointSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private saleService: SaleService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog
  ) {
    const user = this.authService.getUser();
    this.userName = user?.name || '';
  }

  ngOnInit(): void {
    this.breakpointSubscription = this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile.set(result.matches);
      });

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isMobile() && this.sidenav?.opened) {
          this.sidenav.close();
        }
      });
  }

  ngOnDestroy(): void {
    this.breakpointSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  onNavClick(): void {
    if (this.isMobile()) {
      this.sidenav.close();
    }
  }

  openNewSale(): void {
    const dialogRef = this.dialog.open(SaleFormComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saleService.saleCreated$.next();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
