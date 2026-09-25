import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, MapPinIcon, MailIcon } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  readonly MapPinIcon = MapPinIcon;
  readonly MailIcon = MailIcon;
}