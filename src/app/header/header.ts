import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IndexedDb } from '../indexed-db';

@Component({
  selector: 'app-header',
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

  /**
   * Initialisations
   * @param router 
   * @param db 
   */
  constructor(public router: Router, private db: IndexedDb) { }


  /**
   * Propriétés pour la gestion de la modale
   */
  showModalDB = false;
  showModalHelp = false;
  dbMessage = '';
  dbExists = false;


  /**
   * Ouvre la modaleDB pour la gestion de la base de données
   * Vérifie si la base de données existe et affiche un message approprié
   */
  async openModalDB() {
    this.showModalDB = true;
    const dbName = 'RepartitorDB';
    this.dbExists = await this.db.indexedDbExists(dbName);
    if (this.dbExists) {
      this.dbMessage = `Une base "${dbName}" a déjà été créée sur ce navigateur. Vous pouvez l'exporter, l'effacer ou en importer une autre.`;
    } else {
      this.dbMessage = 'Aucune base de données trouvée. Elle sera automatiquement créée lors de la première utilisation de l\'application.';
    }
  }

  /**
   * Ouvre la modale d'aide
   */
  openModalHelp() {
    this.showModalHelp = true;
  }

  /**
   * Ferme la modaleDB
   */
  closeModalDB() {
    this.showModalDB = false;
  }


  /**
  * Ferme la modaleDB
  */
  closeModalHelp() {
    this.showModalHelp = false;
  }


  /**
   * Exporte la base de données en JSON
   * Crée un fichier téléchargeable et déclenche le téléchargement
   */
  async exportDb() {
    const json = await this.db.exportDbAsJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'repartitor-db.json';
    a.click();
    URL.revokeObjectURL(url);
  }


  /**
   * Importe une base de données depuis un fichier JSON
   * Affiche une confirmation avant de procéder à l'importation
   * @param event 
   * @returns 
   */
  async onImportDb(event: Event) {
    const confirmed = confirm('Importer un fichier va écraser toutes les données actuelles. Continuer ?');
    if (!confirmed) return;
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const json = reader.result as string;
        await this.db.importDbFromJson(json);
        this.dbMessage = 'Importation réussie !';
        window.location.reload();
      } catch (e) {
        this.dbMessage = 'Erreur : le fichier n\'est pas valide ou le format est incorrect.';
      }
    };
    reader.readAsText(file);
    // Réinitialise l'input pour permettre une nouvelle importation du même fichier si besoin
    input.value = '';
  }


  /**
   * Efface toute la base de données
   * Affiche une confirmation avant de procéder à l'effacement
   * @returns 
   */
  async eraseDb() {
    const confirmed = confirm('Êtes-vous sûr de vouloir effacer toute la base de données ? Cette action est irréversible.');
    if (!confirmed) return;
    await this.db.clearAllStores();
    this.dbMessage = 'Base effacée !';
    window.location.reload();
  }

}
