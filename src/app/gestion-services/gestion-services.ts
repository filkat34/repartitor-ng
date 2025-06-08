import { Component, OnInit } from '@angular/core';
import { Enseignant } from '../models/enseignant';
import { Division } from '../models/division';
import { IndexedDb } from '../indexed-db';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-gestion-services',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './gestion-services.html',
  styleUrl: './gestion-services.css'
})
export class GestionServices implements OnInit {

  constructor(private db: IndexedDb) { }

  async ngOnInit() {
    this.enseignants = await this.db.getAllEnseignants(true);
    this.divisions = await this.db.getAllDivisions(true);
  }

  enseignants: Enseignant[] = [];
  divisions: Division[] = [];

  getClasseNoForDivision(enseignant: Enseignant, divisionNom: string): number {
    if (!enseignant.classes) return 0;
    const classe = enseignant.classes.find(c => c.nom === divisionNom);
    return classe ? classe.no : 0;
  }

  async addClassToService(enseignant: Enseignant, divisionNom: string) {
    if (!enseignant.classes) {
      enseignant.classes = [];
    }
    const found = enseignant.classes.find(c => c.nom === divisionNom);
    if (found) {
      found.no += 1;
    } else {
      enseignant.classes.push({ no: 1, nom: divisionNom });
    }
    await this.db.updateEnseignant(enseignant);
  }

  getTotalNoForDivision(divisionNom: string): number {
    return this.enseignants
      .flatMap(e => e.classes ?? [])
      .filter(c => c.nom === divisionNom)
      .reduce((sum, c) => sum + c.no, 0);
  }

  async deleteClassFromService(enseignant: Enseignant, divisionNom: string) {
    if (!enseignant.classes) {
      enseignant.classes = [];
    }
    const found = enseignant.classes.find(c => c.nom === divisionNom);
    if (found) {
      if (found.no > 1) {
        found.no -= 1;
      } else {
        enseignant.classes = enseignant.classes.filter(c => c.nom !== divisionNom);
      }
      await this.db.updateEnseignant(enseignant);
    }
  }

  isAddDisabled(division: Division): boolean {
    return this.getTotalNoForDivision(division.nom) >= division.nombreDivisions;
  }

  isDeleteDisabled(enseignant: Enseignant, division: Division): boolean {
    return this.getClasseNoForDivision(enseignant, division.nom) === 0;
  }

  CalculateService(enseignant: Enseignant): number {
    if (!enseignant.classes) return 0;
    return enseignant.classes.reduce((total, c) => {
      const division = this.divisions.find(d => d.nom === c.nom);
      return total + (division ? division.horaire_enseignant * c.no : 0);
    }, 0);
  }

  CalculateHSA(enseignant: Enseignant): number {
    if (!enseignant.classes) return 0;
    else {
      return this.CalculateService(enseignant) - enseignant.service_plancher
    }
  }

  CalculateTotalHSA(): number {
    let totalHSA = 0;
    this.enseignants.forEach(enseignant => {
      const hsa = this.CalculateHSA(enseignant);
      if (hsa > 0) {
        totalHSA += hsa;
      }
    });
    return totalHSA;
  }

  DivisionsNonAffectees(): { nom: string, no: number }[] {
    // Get all assigned division names and their total count
    const affecteesCount: Record<string, number> = {};
    this.enseignants.forEach(e => {
      (e.classes ?? []).forEach(c => {
        affecteesCount[c.nom] = (affecteesCount[c.nom] || 0) + c.no;
      });
    });

    // For each division, calculate how many are unassigned
    return this.divisions
      .map(d => ({
        nom: d.nom,
        no: Math.max(0, d.nombreDivisions - (affecteesCount[d.nom] || 0))
      }))
      .filter(d => d.no > 0);
  }
}
