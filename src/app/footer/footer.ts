import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {

   /**
   * Icones de contact
   */
  contactIcons = [
    {
      href: 'https://github.com/filkat34',
      target: '_blank',
      rel: 'noopener noreferrer',
      class: 'fab fa-github fa-l',
      color: 'text-black',
      label: 'GitHub',
    },
    {
      href: 'mailto:filippos.katsanos@protonmail.com',
      target: '_blank',
      rel: 'noopener noreferrer',
      class: 'fas fa-envelope fa-l',
      color: 'text-black',
      label: 'Email',
    },
  ];
}
