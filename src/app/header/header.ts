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
  constructor(public router: Router, private db: IndexedDb) {}

  showModal = false;
   dbMessage = '';

async openModal() {
  this.showModal = true;
  const dbName = 'RepartitorDB';
  const exists = await this.db.indexedDbExists(dbName);
  if (exists) {
    this.dbMessage = `La base "${dbName}" a été trouvée.`;
  } else {
    this.dbMessage = 'Aucune base de données trouvée. Elle sera automatiquement créée lors de la première utilisation de l\'application.';
  }
}

  closeModal() {
    this.showModal = false;
  }

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

async onImportDb(event: Event) {
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

}
