import { WebsiteData } from '../types';

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
}

class WebsiteStorage {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  private readonly DB_NAME = 'ai-search-db';
  private readonly DB_VERSION = 2;
  private readonly STORES = {
    WEBSITES: 'websites',
    SETTINGS: 'settings',
    KNOWLEDGE: 'knowledge'
  };

  constructor() {
    this.init().catch(console.error);
  }

  private async init(): Promise<void> {
    if (this.db) return;
    
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('Database error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.STORES.WEBSITES)) {
          db.createObjectStore(this.STORES.WEBSITES, { keyPath: 'domain' });
        }
        
        if (!db.objectStoreNames.contains(this.STORES.SETTINGS)) {
          db.createObjectStore(this.STORES.SETTINGS, { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains(this.STORES.KNOWLEDGE)) {
          db.createObjectStore(this.STORES.KNOWLEDGE, { keyPath: 'id' });
        }
      };
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (this.db) return;
    if (!this.initPromise) {
      this.initPromise = this.init();
    }
    await this.initPromise;
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized');
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Website methods
  async saveWebsite(data: WebsiteData): Promise<void> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(this.STORES.WEBSITES, 'readwrite');
        const request = store.put(data);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async getWebsite(domain: string): Promise<WebsiteData | null> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(this.STORES.WEBSITES);
        const request = store.get(domain);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getAllWebsites(): Promise<WebsiteData[]> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(this.STORES.WEBSITES);
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || []);
      } catch (error) {
        reject(error);
      }
    });
  }

  async deleteWebsite(domain: string): Promise<void> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(this.STORES.WEBSITES, 'readwrite');
        const request = store.delete(domain);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Knowledge base methods
  async saveCustomKnowledge(entries: KnowledgeEntry[]): Promise<void> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(this.STORES.KNOWLEDGE, 'readwrite');
        const transaction = store.transaction;

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);

        store.clear();
        entries.forEach(entry => {
          store.add(entry);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async getCustomKnowledge(): Promise<KnowledgeEntry[]> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(this.STORES.KNOWLEDGE);
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || []);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Settings methods
  async saveRules(rules: string): Promise<void> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(this.STORES.SETTINGS, 'readwrite');
        const request = store.put({ key: 'rules', value: rules });
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async getRules(): Promise<string | null> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(this.STORES.SETTINGS);
        const request = store.get('rules');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result?.value || null);
      } catch (error) {
        reject(error);
      }
    });
  }

  async saveSystemPrompt(prompt: string): Promise<void> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(this.STORES.SETTINGS, 'readwrite');
        const request = store.put({ key: 'systemPrompt', value: prompt });
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async getSystemPrompt(): Promise<string | null> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(this.STORES.SETTINGS);
        const request = store.get('systemPrompt');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result?.value || null);
      } catch (error) {
        reject(error);
      }
    });
  }
}

export const websiteStorage = new WebsiteStorage();