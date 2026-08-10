import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Product, Category } from '@/types';
import { posService, MOCK_CATEGORIES, MOCK_PRODUCTS } from '@/services/api';

export const useProductStore = defineStore('products', () => {
  const products = ref<Product[]>(MOCK_PRODUCTS);
  const categories = ref<Category[]>(MOCK_CATEGORIES);
  const selectedCategoryId = ref<number>(1);
  const searchQuery = ref<string>('');
  const isLoading = ref<boolean>(false);

  const filteredProducts = computed(() => {
    return products.value.filter((prod) => {
      // Filter category (ID 1 is "Semua Kategori")
      const matchesCategory =
        selectedCategoryId.value === 1 || prod.category_id === selectedCategoryId.value;

      // Filter search
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
      products.value = await posService.getProducts();
      categories.value = await posService.getCategories();
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
  };
});
