import { PrismaClient } from '@prisma/client';

export async function seedProductsAndCategories(prisma: PrismaClient) {
  console.log('📋 Seeding categories and products...');

  // Categories
  const catFoods = await prisma.category.create({
    data: { name: 'Foods', description: 'Main course meals' },
  });
  
  const catDrinks = await prisma.category.create({
    data: { name: 'Drinks', description: 'Beverages and juices' },
  });
  
  const catSnacks = await prisma.category.create({
    data: { name: 'Snacks', description: 'Light snacks and bites' },
  });

  // Products
  const productsToCreate = [
    {
      name: 'Nasi Goreng Spesial',
      sku: 'FOOD-001',
      description: 'Nasi goreng dengan telur, ayam suwir, dan udang',
      price: 35000,
      category_id: catFoods.id,
      is_active: true,
    },
    {
      name: 'Mie Goreng Seafood',
      sku: 'FOOD-002',
      description: 'Mie goreng dengan topping udang dan cumi',
      price: 38000,
      category_id: catFoods.id,
      is_active: true,
    },
    {
      name: 'Sate Ayam Madura',
      sku: 'FOOD-003',
      description: '10 Tusuk sate ayam dengan bumbu kacang',
      price: 30000,
      category_id: catFoods.id,
      is_active: true,
    },
    {
      name: 'Ayam Bakar Madu',
      sku: 'FOOD-004',
      description: 'Ayam bakar dengan lumuran madu manis gurih',
      price: 28000,
      category_id: catFoods.id,
      is_active: true,
    },
    {
      name: 'Es Teh Manis',
      sku: 'DRINK-001',
      description: 'Teh manis dingin menyegarkan',
      price: 8000,
      category_id: catDrinks.id,
      is_active: true,
    },
    {
      name: 'Kopi Susu Aren',
      sku: 'DRINK-002',
      description: 'Kopi espresso dengan susu dan gula aren murni',
      price: 18000,
      category_id: catDrinks.id,
      is_active: true,
    },
    {
      name: 'Jus Alpukat',
      sku: 'DRINK-003',
      description: 'Jus alpukat kental dengan taburan cokelat',
      price: 20000,
      category_id: catDrinks.id,
      is_active: true,
    },
    {
      name: 'Matcha Latte',
      sku: 'DRINK-004',
      description: 'Premium matcha green tea dengan susu',
      price: 22000,
      category_id: catDrinks.id,
      is_active: true,
    },
    {
      name: 'Kentang Goreng',
      sku: 'SNACK-001',
      description: 'French fries krispi porsi besar',
      price: 15000,
      category_id: catSnacks.id,
      is_active: true,
    },
    {
      name: 'Tahu Cabe Garam',
      sku: 'SNACK-002',
      description: 'Tahu krispi dengan bumbu cabe garam pedas gurih',
      price: 16000,
      category_id: catSnacks.id,
      is_active: true,
    },
    {
      name: 'Pisang Goreng Keju',
      sku: 'SNACK-003',
      description: 'Pisang goreng renyah dengan taburan keju dan susu',
      price: 18000,
      category_id: catSnacks.id,
      is_active: true,
    }
  ];

  const createdProducts = [];
  for (const prodData of productsToCreate) {
    const product = await prisma.product.create({
      data: prodData,
    });
    createdProducts.push(product);

    // Add initial stock batch
    const batch = await prisma.inventoryBatch.create({
      data: {
        product_id: product.id,
        received_date: new Date(),
        initial_quantity: 100,
        remaining_quantity: 100,
        cost_per_unit: product.price * 0.4, // Assume 40% cost
      },
    });

    // Add stock log
    await prisma.stock.create({
      data: {
        product_id: product.id,
        quantity: 100,
        type: 'IN',
        notes: 'Initial mockup stock',
      },
    });
  }

  console.log(`✅ ${createdProducts.length} products and 3 categories seeded`);
  return { catFoods, catDrinks, catSnacks, createdProducts };
}
