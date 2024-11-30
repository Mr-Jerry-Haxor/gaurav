import { BrowserModule } from '@angular/platform-browser';
import { NgModule, importProvidersFrom } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SummaryComponent } from './components/summary/summary.component';
import { ReportsComponent } from './components/reports/reports.component';
import { AdminComponent } from './components/admin/admin.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { ApiService } from './services/api.service';
import { AuthInterceptor } from './services/auth.interceptor';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AppComponent,
    LoginComponent,
    DashboardComponent,
    SummaryComponent,
    ReportsComponent,
    AdminComponent,
    NavbarComponent,
    PageNotFoundComponent
  ],
  providers: [
    AuthService,
    TokenService,
    ApiService,
    provideHttpClient(),
    importProvidersFrom(AppRoutingModule),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export const appConfig = {
  providers: [
    importProvidersFrom(AppModule)
  ]
};