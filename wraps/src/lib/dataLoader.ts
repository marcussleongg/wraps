import fs from 'fs';
import path from 'path';
import { Transaction } from '@/types/spending';

export interface MerchantData {
  merchantId: number;
  merchantName: string;
  transactions: Transaction[];
}

export class DataLoader {
  private dataDirectory: string;

  constructor(dataDirectory?: string) {
    // Use relative path from project root in production/development
    this.dataDirectory = dataDirectory || path.join(process.cwd(), 'data');
  }

  /**
   * Get all merchant files from the data directory
   */
  private getMerchantFiles(): string[] {
    try {
      if (!fs.existsSync(this.dataDirectory)) {
        console.error(`Data directory does not exist: ${this.dataDirectory}`);
        return [];
      }
      
      const files = fs.readdirSync(this.dataDirectory);
      return files.filter(file => file.endsWith('.json') && file.startsWith('development_'));
    } catch (error) {
      console.error('Error reading data directory:', error);
      return [];
    }
  }

  /**
   * Extract merchant ID and name from filename
   */
  private parseMerchantInfo(filename: string): { id: number; name: string } {
    // Format: development_44_amazon.json
    const parts = filename.replace('.json', '').split('_');
    const id = parseInt(parts[1]);
    const name = parts.slice(2).join('_').replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letters
    
    return { id, name };
  }

  /**
   * Load transactions from a specific merchant file
   */
  private loadMerchantTransactions(filename: string): Transaction[] {
    try {
      const filePath = path.join(this.dataDirectory, filename);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent) as Transaction[];
    } catch (error) {
      console.error(`Error loading file ${filename}:`, error);
      return [];
    }
  }

  /**
   * Load all merchant data
   */
  public loadAllMerchantData(): MerchantData[] {
    const files = this.getMerchantFiles();
    const merchantData: MerchantData[] = [];

    for (const file of files) {
      const { id, name } = this.parseMerchantInfo(file);
      const transactions = this.loadMerchantTransactions(file);
      
      if (transactions.length > 0) {
        merchantData.push({
          merchantId: id,
          merchantName: name,
          transactions
        });
      }
    }

    return merchantData;
  }

  /**
   * Load data for a specific merchant
   */
  public loadMerchantData(merchantId: number): MerchantData | null {
    const files = this.getMerchantFiles();
    const targetFile = files.find(file => {
      const { id } = this.parseMerchantInfo(file);
      return id === merchantId;
    });

    if (!targetFile) {
      return null;
    }

    const { id, name } = this.parseMerchantInfo(targetFile);
    const transactions = this.loadMerchantTransactions(targetFile);

    return {
      merchantId: id,
      merchantName: name,
      transactions
    };
  }

  /**
   * Get available merchant IDs and names
   */
  public getAvailableMerchants(): Array<{ id: number; name: string }> {
    const files = this.getMerchantFiles();
    return files.map(file => this.parseMerchantInfo(file));
  }
}
