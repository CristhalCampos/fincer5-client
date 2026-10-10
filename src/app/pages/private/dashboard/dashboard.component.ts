import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../core/services/auth.service';
import {
  LucideAngularModule,
  WalletIcon,
  PlusIcon,
  PlusCircleIcon,
  TargetIcon,
  ScanLineIcon
} from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  user: User | null = null;

  readonly WalletIcon = WalletIcon;
  readonly PlusIcon = PlusIcon;
  readonly PlusCircleIcon = PlusCircleIcon;
  readonly TargetIcon = TargetIcon;
  readonly ScanLineIcon = ScanLineIcon;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }
}