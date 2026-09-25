import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  TrendingDownIcon,
  StoreIcon,
  TriangleAlertIcon,
  ShieldIcon,
  RefreshCwIcon,
  ActivityIcon
} from 'lucide-angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  readonly TrendingDownIcon = TrendingDownIcon;
  readonly StoreIcon = StoreIcon;
  readonly AlertTriangleIcon = TriangleAlertIcon;
  readonly ShieldIcon = ShieldIcon;
  readonly RefreshCwIcon = RefreshCwIcon;
  readonly ActivityIcon = ActivityIcon;
}