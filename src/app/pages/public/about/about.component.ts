import { Component } from '@angular/core';
import {
  LucideAngularModule,
  UsersIcon,
  EyeIcon,
  WrenchIcon,
  WheatIcon
} from 'lucide-angular';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './about.component.html'
})
export class AboutComponent {
  readonly UsersIcon = UsersIcon;
  readonly EyeIcon = EyeIcon;
  readonly WrenchIcon = WrenchIcon;
  readonly WheatIcon = WheatIcon;
}