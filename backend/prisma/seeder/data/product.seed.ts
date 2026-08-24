import { PrismaClient } from '@prisma/client';

export async function seedProductsAndCategories(prisma: PrismaClient) {
  console.log('📋 Seeding minimarket categories and products...');

  // Categories
  const catMinuman = await prisma.category.create({
    data: { name: 'Minuman Ringan', description: 'Air mineral, soda, susu, teh, dll' },
  });
  
  const catSnack = await prisma.category.create({
    data: { name: 'Makanan Ringan', description: 'Cemilan, keripik, biskuit' },
  });
  
  const catKebutuhan = await prisma.category.create({
    data: { name: 'Kebutuhan Dapur', description: 'Mie instan, beras, minyak goreng, dll' },
  });

  const catPerawatan = await prisma.category.create({
    data: { name: 'Perawatan Diri & Rumah', description: 'Sabun, pasta gigi, deterjen' },
  });

  // Products
  const productsToCreate = [
    {
      name: 'Indomie Goreng Spesial 85g',
      sku: 'KBT-001',
      description: 'Mie instan goreng favorit keluarga',
      price: 3500,
      category_id: catKebutuhan.id,
      is_active: true,
    },
    {
      name: 'Beras Ramos Setra 5kg',
      sku: 'KBT-002',
      description: 'Beras putih pulen berkualitas',
      price: 68000,
      category_id: catKebutuhan.id,
      is_active: true,
    },
    {
      name: 'Minyak Goreng Bimoli 2L',
      sku: 'KBT-003',
      description: 'Minyak goreng kelapa sawit refill',
      price: 38500,
      category_id: catKebutuhan.id,
      is_active: true,
    },
    {
      name: 'Aqua Air Mineral 600ml',
      sku: 'MNM-001',
      description: 'Air minum dalam kemasan botol',
      price: 3500,
      category_id: catMinuman.id,
      is_active: true,
    },
    {
      name: 'Coca Cola 1.5L',
      sku: 'MNM-002',
      description: 'Minuman ringan berkarbonasi ukuran besar',
      price: 15500,
      category_id: catMinuman.id,
      is_active: true,
    },
    {
      name: 'Pocari Sweat 500ml',
      sku: 'MNM-003',
      description: 'Minuman isotonik pengganti ion tubuh',
      price: 7500,
      category_id: catMinuman.id,
      is_active: true,
    },
    {
      name: 'Susu Ultra Coklat 250ml',
      sku: 'MNM-004',
      description: 'Susu UHT rasa coklat',
      price: 6000,
      category_id: catMinuman.id,
      is_active: true,
    },
    {
      name: 'Chitato Sapi Panggang 68g',
      sku: 'SNK-001',
      description: 'Keripik kentang rasa sapi panggang',
      price: 11500,
      category_id: catSnack.id,
      is_active: true,
    },
    {
      name: 'Taro Net Seaweed 65g',
      sku: 'SNK-002',
      description: 'Snack chiki rasa rumput laut',
      price: 9000,
      category_id: catSnack.id,
      is_active: true,
    },
    {
      name: 'Sari Roti Tawar Kupas',
      sku: 'SNK-003',
      description: 'Roti tawar kupas lembut',
      price: 18000,
      category_id: catSnack.id,
      is_active: true,
    },
    {
      name: 'Pepsodent White 190g',
      sku: 'PRW-001',
      description: 'Pasta gigi pencegah gigi berlubang',
      price: 12500,
      category_id: catPerawatan.id,
      is_active: true,
    },
    {
      name: 'Rinso Anti Noda 700g',
      sku: 'PRW-002',
      description: 'Deterjen bubuk anti noda',
      price: 22000,
      category_id: catPerawatan.id,
      is_active: true,
    },
    {
      name: 'Sabun Lifebuoy Total 10 110g',
      sku: 'PRW-003',
      description: 'Sabun mandi batang antibakteri',
      price: 4500,
      category_id: catPerawatan.id,
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
        initial_quantity: 150, // Lebih banyak stok untuk minimarket
        remaining_quantity: 150,
        cost_per_unit: product.price * 0.7, // Asumsi harga beli (HPP) 70% dari harga jual
      },
    });

    // Add stock log
    await prisma.stock.create({
      data: {
        product_id: product.id,
        quantity: 150,
        type: 'IN',
        notes: 'Initial minimarket stock mockup',
      },
    });
  }

  console.log(`✅ ${createdProducts.length} minimarket products and 4 categories seeded`);
  return { catMinuman, catSnack, catKebutuhan, catPerawatan, createdProducts };
}
