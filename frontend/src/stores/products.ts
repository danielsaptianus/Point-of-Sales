import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Product, Category } from '@/types';
import api from '@/plugins/axios';

export const useProductStore = defineStore('products', () => {
  const products = ref<Product[]>([]);
  const categories = ref<Category[]>([]);
  const selectedCategoryId = ref<number>(0); // 0 means "All Categories"
  const searchQuery = ref<string>('');
  const isLoading = ref<boolean>(false);

  const filteredProducts = computed(() => {
    return products.value.filter((prod) => {
      const matchesCategory =
        selectedCategoryId.value === 0 || prod.category_id === selectedCategoryId.value;

      const query = searchQuery.value.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        prod.name.toLowerCase().includes(query) ||
        prod.sku.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  });

  async function fetchProducts() {
    isLoading.value = true;
    try {
      // Fetch categories
      const catRes = await api.get('/categories');
      const allCategories = catRes.data.data || [];
      categories.value = [
        { id: 0, name: 'Semua Kategori', icon: 'LayoutGrid' },
        ...allCategories
      ];

      // Fetch products
      const prodRes = await api.get('/products');
      products.value = prodRes.data.data || [];
    } catch (error) {
      console.error('Failed to fetch products/categories:', error);
    } finally {
      isLoading.value = false;
    }
  }

  function setCategory(id: number) {
    selectedCategoryId.value = id;
  }

  function setSearch(query: string) {
    searchQuery.value = query;
  }

  async function addProduct(product: Omit<Product, 'id'>) {
    try {
      const res = await api.post('/products', product);
      products.value.push(res.data.data);
    } catch (error) {
      console.error('Failed to add product:', error);
      throw error;
    }
  }

  async function updateProduct(id: number, updatedData: Partial<Product>) {
    try {
      const res = await api.patch(`/products/${id}`, updatedData);
      const index = products.value.findIndex(p => p.id === id);
      if (index !== -1) {
        products.value[index] = res.data.data;
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  }

  async function deleteProduct(id: number) {
    try {
      await api.delete(`/products/${id}`);
      products.value = products.value.filter(p => p.id !== id);
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  }

  // Category CRUD
  async function addCategory(category: Omit<Category, 'id'>) {
    try {
      const res = await api.post('/categories', category);
      categories.value.push(res.data.data);
    } catch (error) {
      console.error('Failed to add category:', error);
      throw error;
    }
  }

  async function updateCategory(id: number, updatedData: Partial<Category>) {
    try {
      const res = await api.patch(`/categories/${id}`, updatedData);
      const index = categories.value.findIndex(c => c.id === id);
      if (index !== -1) {
        categories.value[index] = res.data.data;
      }
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  }

  async function deleteCategory(id: number) {
    try {
      await api.delete(`/categories/${id}`);
      categories.value = categories.value.filter(c => c.id !== id);
      // Reset selected category if deleted
      if (selectedCategoryId.value === id) {
        selectedCategoryId.value = 0;
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  }

  return {
    products,
    categories,
    selectedCategoryId,
    searchQuery,
    isLoading,
    filteredProducts,
    fetchProducts,
    setCategory,
    setSearch,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
  };
});
