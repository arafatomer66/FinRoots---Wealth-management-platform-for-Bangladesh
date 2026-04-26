import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    @if (authService.isLoggedIn()) {
      <app-sidebar />
      <main class="main-content">
        <router-outlet />
      </main>
    } @else {
      <router-outlet />
    }
  `,
  styles: [`
    .main-content {
      margin-left: 260px;
      padding: 32px 40px;
      min-height: 100vh;
      background: var(--bg-primary);
    }
  `],
})
export class App {
  constructor(public authService: AuthService) {}
}
