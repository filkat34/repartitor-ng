import { Component, OnInit } from '@angular/core';
import { Enseignant } from '../models/enseignant';
import { IndexedDb } from '../indexed-db';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gestion-enseignants',
  imports: [FormsModule, CommonModule],
  templateUrl: './gestion-enseignants.html',
  styleUrl: './gestion-enseignants.css'
})
export class GestionEnseignants implements OnInit {

  // Propriétés pour la gestion des enseignants
  nouvelEnseignant: Partial<Enseignant> = { quotite: 100 };
  enseignants: Enseignant[] = [];

  constructor(private db: IndexedDb) { }

  ngOnInit() {
    this.loadEnseignants();
  }

  async loadEnseignants() {
    this.enseignants = await this.db.getAllEnseignants();
  }

  async onSubmit() {
    const enseignant: Enseignant = {
      id: Date.now(),
      nom: this.nouvelEnseignant.nom!
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase(),
      corps: this.nouvelEnseignant.corps!,
      ors: this.nouvelEnseignant.ors!,
      quotite: this.nouvelEnseignant.quotite!,
      service_plancher: ((this.nouvelEnseignant.ors ?? 0) * (this.nouvelEnseignant.quotite ?? 0)) / 100,
    };
    await this.db.addEnseignant(enseignant);
    this.nouvelEnseignant = {};
    await this.loadEnseignants(); // Recharge la liste après ajout
  }

  setOrsSelonCorps(corps: string) {
    if (corps === 'AGREGE(E)') {
      this.nouvelEnseignant.ors = 15;
    } else if (corps === 'CERTIFIE(E)') {
      this.nouvelEnseignant.ors = 18;
    } else {
      this.nouvelEnseignant.ors = undefined;
    }
  }

}
