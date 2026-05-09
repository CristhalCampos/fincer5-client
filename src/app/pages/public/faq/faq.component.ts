import { Component } from '@angular/core';
import { LucideAngularModule, HandHelpingIcon } from 'lucide-angular';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './faq.component.html'
})
export class FaqComponent {
  readonly HelpIcon = HandHelpingIcon;
}