import { MandiPriceRepository } from './mandi-price.repository';
import { CreateMandiPriceInput, UpdateMandiPriceInput, MandiPriceQueryInput } from './mandi-price.schema';
import { NotFoundError } from '../../shared/errors/app-error';

// In-memory cache for Mandi Price listing (3-minute TTL)
interface CacheEntry<T> {
  data: T;
  cachedAt: number;
}

const priceCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

export class MandiPriceService {
  private mandiPriceRepository: MandiPriceRepository;

  constructor(mandiPriceRepository = new MandiPriceRepository()) {
    this.mandiPriceRepository = mandiPriceRepository;
  }

  private clearCache(): void {
    priceCache.clear();
  }

  async createMandiPrice(adminId: string, input: CreateMandiPriceInput) {
    const result = await this.mandiPriceRepository.createMandiPrice(adminId, input);
    this.clearCache();
    return result;
  }

  async getMandiPrices(query: MandiPriceQueryInput) {
    const cacheKey = JSON.stringify(query);
    const cached = priceCache.get(cacheKey);

    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return cached.data;
    }

    const result = await this.mandiPriceRepository.findMandiPrices(query);
    priceCache.set(cacheKey, { data: result, cachedAt: Date.now() });
    return result;
  }

  async getMandiPriceById(id: string) {
    const mandiPrice = await this.mandiPriceRepository.findMandiPriceById(id);
    if (!mandiPrice) {
      throw new NotFoundError('Mandi price entry not found');
    }
    return mandiPrice;
  }

  async updateMandiPrice(id: string, adminId: string, input: UpdateMandiPriceInput) {
    const existing = await this.mandiPriceRepository.findMandiPriceById(id);
    if (!existing) {
      throw new NotFoundError('Mandi price entry not found');
    }
    const result = await this.mandiPriceRepository.updateMandiPrice(id, adminId, input);
    this.clearCache();
    return result;
  }

  async deleteMandiPrice(id: string, adminId: string) {
    const existing = await this.mandiPriceRepository.findMandiPriceById(id);
    if (!existing) {
      throw new NotFoundError('Mandi price entry not found');
    }
    const result = await this.mandiPriceRepository.deleteMandiPrice(id, adminId);
    this.clearCache();
    return result;
  }
}

