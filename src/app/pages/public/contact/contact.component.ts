import { Component } from '@angular/core';
import {
  LucideAngularModule,
  MailIcon,
  ClockIcon,
  MapPinIcon
} from 'lucide-angular';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './contact.component.html'
})
export class ContactComponent {
  readonly MailIcon = MailIcon;
  readonly ClockIcon = ClockIcon;
  readonly MapPinIcon = MapPinIcon;
}