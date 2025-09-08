import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface PartnerStore {
  id: string;
  name: string;
  type: string;
  city: string;
  latitude: number;
  longitude: number;
  rating: number;
  image: string;
  phone: string;
  hours: string;
  description: string;
}

/**
 * Fetches all partner stores from Firestore
 * @returns Promise<PartnerStore[]> Array of partner stores
 */
export const fetchPartnerStores = async (): Promise<PartnerStore[]> => {
  try {
    const partnerStoresCollection = collection(db, 'partner_store');
    const querySnapshot = await getDocs(partnerStoresCollection);
    
    const partnerStores: PartnerStore[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      partnerStores.push({
        id: doc.id,
        name: data.name || '',
        type: data.type || '',
        city: data.city || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        rating: data.rating || 0,
        image: data.image || '',
        phone: data.phone || '',
        hours: data.hours || '',
        description: data.description || '',
      });
    });
    
    return partnerStores;
  } catch (error) {
    console.error('Error fetching partner stores:', error);
    throw new Error('Failed to fetch partner stores');
  }
};

/**
 * Groups partner stores by city
 * @param stores Array of partner stores
 * @returns Record<string, PartnerStore[]> Stores grouped by city
 */
export const groupStoresByCity = (stores: PartnerStore[]): Record<string, PartnerStore[]> => {
  return stores.reduce((acc, store) => {
    if (!acc[store.city]) {
      acc[store.city] = [];
    }
    acc[store.city].push(store);
    return acc;
  }, {} as Record<string, PartnerStore[]>);
};

/**
 * Gets unique cities from partner stores
 * @param stores Array of partner stores
 * @returns string[] Array of unique city names
 */
export const getUniqueCities = (stores: PartnerStore[]): string[] => {
  const cities = stores.map(store => store.city);
  return [...new Set(cities)].sort();
};