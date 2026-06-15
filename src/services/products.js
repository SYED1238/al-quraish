import { poultryProducts } from '../data/poultryProducts';

const LOCAL_STORAGE_KEY = 'al_quraish_catalog_v1';

const getStoredProducts = () => {
  if (typeof window === 'undefined') return poultryProducts;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(poultryProducts));
    return poultryProducts;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse stored products', e);
    return poultryProducts;
  }
};

const saveStoredProducts = (products) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
};

const mapDbProductToFrontend = (prod) => ({
  id: prod.id,
  name: prod.name,
  category: prod.category,
  heroImage: prod.heroImage || prod.image,
  image: prod.heroImage || prod.image,
  description: prod.description || '',
  basePrice: Number(prod.basePrice),
  price: Number(prod.basePrice),
  stock: prod.stock || 50,
  tags: prod.tags || [],
  weightVariants: prod.weightVariants || ['250g', '500g', '750g', '1kg', '2kg'],
  origin: prod.origin || 'Local Farmstead',
  freshnessScore: prod.freshnessScore || 99,
  processDate: prod.processDate || 'Today',
  delivery: prod.eta || 'Same-day delivery before 6 PM',
  eta: prod.eta || 'Same-day delivery before 6 PM',
  packaging: prod.packaging || 'Airtight Freshness Shield',
  availability: prod.availability || 'In Stock',
  nutrition: prod.nutrition || { protein: '0g', fat: '0g', energy: '0 kcal', carbs: '0g' },
  preparation: prod.preparation || '',
  gallery: prod.gallery || []
});

export const productsService = {
  // Fetch all products
  getAllProducts: async () => {
    return getStoredProducts().map(mapDbProductToFrontend);
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    const all = getStoredProducts().map(mapDbProductToFrontend);
    if (!category || category.toLowerCase() === 'all') {
      return all;
    }
    return all.filter(p => p.category.toLowerCase() === category.toLowerCase());
  },

  // Get product by ID
  getProductById: async (id) => {
    const all = getStoredProducts().map(mapDbProductToFrontend);
    return all.find(p => p.id === id) || null;
  },

  // Update product record
  updateProduct: async (id, updateData) => {
    const prods = getStoredProducts();
    const idx = prods.findIndex(p => p.id === id);
    if (idx !== -1) {
      // Sync basePrice and price fields if either is changed
      const priceVal = updateData.price !== undefined ? updateData.price : updateData.basePrice;
      const merged = { ...prods[idx], ...updateData };
      if (priceVal !== undefined) {
        merged.basePrice = Number(priceVal);
        merged.price = Number(priceVal);
      }
      prods[idx] = merged;
      saveStoredProducts(prods);
      return mapDbProductToFrontend(prods[idx]);
    }
    return null;
  },

  // Add new product
  addProduct: async (newProduct) => {
    const prods = getStoredProducts();
    const exists = prods.some(p => p.id === newProduct.id);
    if (exists) {
      throw new Error(`A product with ID '${newProduct.id}' already exists.`);
    }
    prods.push(newProduct);
    saveStoredProducts(prods);
    return mapDbProductToFrontend(newProduct);
  },

  // Delete product
  deleteProduct: async (id) => {
    const prods = getStoredProducts();
    const filtered = prods.filter(p => p.id !== id);
    saveStoredProducts(filtered);
    return true;
  }
};
