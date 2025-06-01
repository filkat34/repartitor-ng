import { Injectable } from '@angular/core';
import { Enseignant } from './models/enseignant';
import { Division } from './models/division';

@Injectable({
  providedIn: 'root'
})
export class IndexedDb {

  db: IDBDatabase | null = null;
  private dbReady: Promise<void>;
  private dbReadyResolve!: () => void;

  constructor() {
    this.dbReady = new Promise(resolve => (this.dbReadyResolve = resolve));
    this.openDb();
  }

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

  updateEnseignant(enseignant: Enseignant) {
    if (!this.db) return;
    const tx = this.db.transaction('enseignants', 'readwrite');
    const store = tx.objectStore('enseignants');
    store.put(enseignant);
  }

  deleteEnseignant(id: number) {
    if (!this.db) return;
    const tx = this.db.transaction('enseignants', 'readwrite');
    const store = tx.objectStore('enseignants');
    store.delete(id);
  }

  async getAllEnseignants(): Promise<Enseignant[]> {
    await this.dbReady;
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve([]);
      const tx = this.db.transaction('enseignants', 'readonly');
      const store = tx.objectStore('enseignants');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
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
