import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-accueil',
  imports: [RouterModule],
  templateUrl: './accueil.html',
  styleUrl: './accueil.css'
})
export class Accueil {

   constructor(public router: Router) {}

}
