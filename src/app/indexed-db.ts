import { Injectable } from '@angular/core';
import { Enseignant } from './models/enseignant';
import { Division } from './models/division';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class IndexedDb {

   
  /**
   * Propriétés pour stocker la base de données IndexedDB.
   */
  db: IDBDatabase | null = null;// Instance de la base de données IndexedDB
  private dbReady: Promise<void>;// Promise pour indiquer que la base de données est prête
  private dbReadyResolve!: () => void;// Promise pour indiquer que la base de données est prête
  dbChanged$ = new Subject<void>();// Observable pour notifier les changements dans la base de données


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
      request.onsuccess = () => {
      this.dbChanged$.next();
      resolve();
    };
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
      request.onsuccess = () => {
      this.dbChanged$.next();
      resolve();
    };
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
    this.dbChanged$.next();
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


  /**
   * Ajout d'une division dans la base de données.
   * @param division 
   * @returns 
   */
  addDivision(division: Division): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      const tx = this.db.transaction('divisions', 'readwrite');
      const store = tx.objectStore('divisions');
      const request = store.add(division);
      request.onsuccess = () => {
      this.dbChanged$.next();
      resolve();
    };
      request.onerror = () => reject(request.error);
    });
  }


  /**
   * Mise à jour d'une division dans la base de données.
   * @param division 
   * @returns 
   */
  async updateDivision(division: Division): Promise<void> {
    await this.dbReady;
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      const tx = this.db.transaction('divisions', 'readwrite');
      const store = tx.objectStore('divisions');
      const request = store.put(division);
      request.onsuccess = () => {
      this.dbChanged$.next();
      resolve();
    };
      request.onerror = () => reject(request.error);
    });
  }


  /**
   * Suppression d'une division de la base de données.
   * @param id 
   * @returns 
   */
  deleteDivision(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      const tx = this.db.transaction('divisions', 'readwrite');
      const store = tx.objectStore('divisions');
      const request = store.delete(id);
      request.onsuccess = () => {
      this.dbChanged$.next();
      resolve();
    };
      request.onerror = () => reject(request.error);
    });
  }


  /**
   * Récupération de toutes les divisions de la base de données.
   * @returns 
   */
  async getAllDivisions(sorted: boolean = false): Promise<Division[]> {
    await this.dbReady;
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve([]);
      const tx = this.db.transaction('divisions', 'readonly');
      const store = tx.objectStore('divisions');
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


  /**
   * Vérifie si une base de données IndexedDB existe sans l'ouvrir.
   * Utilise indexedDB.databases() si disponible, sinon retourne false pour les navigateurs anciens.
   * @param dbName Nom de la base de données à vérifier
   * @returns 
   */
  indexedDbExists(dbName: string): Promise<boolean> {
    // Utilise indexedDB.databases() si disponible (navigateurs modernes)
    if (typeof indexedDB.databases === 'function') {
      return indexedDB.databases()
        .then(dbs => dbs.some(db => db.name === dbName))
        .catch(() => false);
    }
    // Fallback pour navigateurs anciens : on ne peut pas savoir sans ouvrir
    return Promise.resolve(false);
  }


  /**
 * Exporte toute la base de données (enseignants et divisions) au format JSON.
 * @returns Promise<string> - le contenu JSON prêt à être téléchargé
 */
  async exportDbAsJson(): Promise<string> {
    await this.dbReady;
    const enseignants = await this.getAllEnseignants();
    const divisions = await this.getAllDivisions();
    const data = { enseignants, divisions };
    return JSON.stringify(data, null, 2);
  }


  /**
 * Vérifie si un JSON correspond au format attendu pour l'import de la base.
 * @param json Le contenu JSON à vérifier
 * @returns true si le format est correct, false sinon
 */
  isValidDbJson(json: string): boolean {
    try {
      const data = JSON.parse(json);
      // Vérifie la présence des deux propriétés attendues
      if (!data || typeof data !== 'object') return false;
      if (!Array.isArray(data.enseignants) || !Array.isArray(data.divisions)) return false;

      // Vérification basique de la structure d'un enseignant
      if (data.enseignants.length > 0) {
        const e = data.enseignants[0];
        if (typeof e !== 'object' || !('id' in e) || !('nom' in e)) return false;
      }
      // Vérification basique de la structure d'une division
      if (data.divisions.length > 0) {
        const d = data.divisions[0];
        if (typeof d !== 'object' || !('id' in d) || !('nom' in d)) return false;
      }
      return true;
    } catch {
      return false;
    }
  }


  /**
   * Importe une base de données depuis un JSON et écrase la base actuelle.
   * @param json Le contenu JSON à importer
   * @returns Promise<void>
   */
  async importDbFromJson(json: string): Promise<void> {
    await this.dbReady;
    if (!this.isValidDbJson(json)) {
      throw new Error('Le fichier JSON ne correspond pas au format attendu.');
    }
    const data = JSON.parse(json);

    // Efface les stores existants
    await this.clearAllStores();

    // Réinjecte les données
    if (Array.isArray(data.enseignants)) {
      for (const enseignant of data.enseignants) {
        await this.addEnseignant(enseignant);
      }
    }
    if (Array.isArray(data.divisions)) {
      for (const division of data.divisions) {
        await this.addDivision(division);
      }
    }
    this.dbChanged$.next();
  }

  
  /**
 * Efface tous les stores (enseignants et divisions) de la base de données.
 * @returns Promise<void>
 */
  async clearAllStores(): Promise<void> {
    await this.dbReady;
    if (!this.db) return;
    // Efface les enseignants
    await new Promise<void>((resolve, reject) => {
      const tx = this.db!.transaction('enseignants', 'readwrite');
      const store = tx.objectStore('enseignants');
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });
    // Efface les divisions
    await new Promise<void>((resolve, reject) => {
      const tx = this.db!.transaction('divisions', 'readwrite');
      const store = tx.objectStore('divisions');
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });
  }
}


