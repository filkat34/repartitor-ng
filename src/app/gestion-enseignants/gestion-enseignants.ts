import { Component } from '@angular/core';
import { Enseignant } from '../models/enseignant';
import { IndexedDb } from '../indexed-db';

@Component({
  selector: 'app-gestion-enseignants',
  imports: [],
  templateUrl: './gestion-enseignants.html',
  styleUrl: './gestion-enseignants.css'
})
export class GestionEnseignants {
  constructor(private db: IndexedDb) {}

}
