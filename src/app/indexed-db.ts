import { Injectable } from '@angular/core';
import { Enseignant } from './models/enseignant';
import { Division } from './models/division';

@Injectable({
  providedIn: 'root'
})
export class IndexedDb {

  /**
   * Propriétés pour stocker la base de données IndexedDB.
   */
  db: IDBDatabase | null = null;
  private dbReady: Promise<void>;
  private dbReadyResolve!: () => void;

  /**
   * Initialisation du service IndexedDB.
   * La base de données est ouverte et les object stores sont créés si nécessaire.
   * La promesse dbReady est résolue lorsque la base de données est prête.
   */
  constructor() {
    this.dbReady = new Promise(resolve => (this.dbReadyResolve = resolve));
    this.openDb();
  }

  /**
   * Ouverture de la base de données IndexedDB.
   * Création des object stores pour les enseignants et les divisions si nécessaire.
   */
  openDb() {
    const request = indexedDB.open('RepartitorDB', 1);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('enseignants')) {
        db.createObjectStore('enseignants', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('divisions')) {
        db.createObjectStore('divisions', { keyPath: 'id' });
      }
    };
    request.onsuccess = (event: any) => {
      this.db = event.target.result;
      this.dbReadyResolve();
    };
    request.onerror = (event: any) => {
      console.error('Database error:', event.target.errorCode);
    };
  }

  /**
   * Ajout d'un enseignant dans la base de données.
   * @param enseignant 
   * @returns 
   */
  addEnseignant(enseignant: Enseignant): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      const tx = this.db.transaction('enseignants', 'readwrite');
      const store = tx.objectStore('enseignants');
      const request = store.add(enseignant);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Mise à jour d'un enseignant dans la base de données.
   * @param enseignant 
   * @returns 
   */
async updateEnseignant(enseignant: Enseignant): Promise<void> {
  await this.dbReady;
  return new Promise((resolve, reject) => {
    if (!this.db) return resolve();
    const tx = this.db.transaction('enseignants', 'readwrite');
    const store = tx.objectStore('enseignants');
    const request = store.put(enseignant);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Suppression d'un enseignant de la base de données.
 * @param id 
 * @returns 
 */
  deleteEnseignant(id: number) {
    if (!this.db) return;
    const tx = this.db.transaction('enseignants', 'readwrite');
    const store = tx.objectStore('enseignants');
    store.delete(id);
  }

  /**
   * Récupération de tous les enseignants de la base de données pour affichage dans la liste.
   * @returns 
   */
 async getAllEnseignants(sorted: boolean = false): Promise<Enseignant[]> {
  await this.dbReady;
  return new Promise((resolve, reject) => {
    if (!this.db) return resolve([]);
    const tx = this.db.transaction('enseignants', 'readonly');
    const store = tx.objectStore('enseignants');
    const request = store.getAll();
    request.onsuccess = () => {
      let result = request.result;
      if (sorted) {
        result = result.sort((a, b) =>
          a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' })
        );
      }
      resolve(result);
    };
    request.onerror = () => reject(request.error);
  });
}



  // Division methods
  addDivision(division: Division) {
    if (!this.db) return;
    const tx = this.db.transaction('divisions', 'readwrite');
    const store = tx.objectStore('divisions');
    store.add(division);
  }

  updateDivision(division: Division) {
    if (!this.db) return;
    const tx = this.db.transaction('divisions', 'readwrite');
    const store = tx.objectStore('divisions');
    store.put(division);
  }

  deleteDivision(id: number) {
    if (!this.db) return;
    const tx = this.db.transaction('divisions', 'readwrite');
    const store = tx.objectStore('divisions');
    store.delete(id);
  }
}
