import { Injectable } from '@angular/core';
import { Enseignant } from './models/enseignant';
import { Division } from './models/division';

@Injectable({
  providedIn: 'root'
})
export class IndexedDb {

  constructor() { }

  db: IDBDatabase | null = null;

  openDb() {
    const request = indexedDB.open('MyAppDB', 1);
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
    };
    request.onerror = (event: any) => {
      console.error('Database error:', event.target.errorCode);
    };
  }

  addEnseignant(enseignant: Enseignant) {
    if (!this.db) return;
    const tx = this.db.transaction('enseignants', 'readwrite');
    const store = tx.objectStore('enseignants');
    store.add(enseignant);
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
