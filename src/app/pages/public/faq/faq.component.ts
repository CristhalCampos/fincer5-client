import { Component } from '@angular/core';
import {
  LucideAngularModule,
  HandHelpingIcon,
  ShieldIcon,
  CreditCardIcon,
  ChartBarIcon,
  ChevronDownIcon
} from 'lucide-angular';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './faq.component.html'
})
export class FaqComponent {
  readonly HelpIcon = HandHelpingIcon;
  readonly ShieldIcon = ShieldIcon;
  readonly CreditCardIcon = CreditCardIcon;
  readonly ChartBarIcon = ChartBarIcon;
  readonly ChevronDownIcon = ChevronDownIcon;
}