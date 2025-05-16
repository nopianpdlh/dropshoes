const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  // Buat kategori
  const categories = [
    { name: "Sneakers" },
    { name: "Running" },
    { name: "Basketball" },
    { name: "Casual" },
    { name: "Formal" },
    { name: "Sandal" },
    { name: "Sport" },
    { name: "Training" },
  ];

  console.log("Menambahkan kategori...");
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  // Buat admin default jika belum ada user
  const adminEmail = "admin@example.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    console.log("Membuat akun admin default...");
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin",
        password: await hash("admin123", 10),
        role: "ADMIN",
      },
    });
  }

  // Buat beberapa produk dummy
  const products = [
    {
      name: "Nike Air Max 270",
      description: "Sepatu lifestyle dengan bantalan udara yang nyaman",
      price: 1899000,
      stock: 50,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      ],
      categoryName: "Sneakers",
    },
    {
      name: "Adidas Ultraboost",
      description:
        "Sepatu lari dengan teknologi Boost untuk kenyamanan maksimal",
      price: 2499000,
      stock: 30,
      images: [
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80",
      ],
      categoryName: "Running",
    },
    {
      name: "Nike Zoom Freak",
      description: "Sepatu basket signature dari Giannis Antetokounmpo",
      price: 1699000,
      stock: 25,
      images: [
        "https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=800&q=80",
      ],
      categoryName: "Basketball",
    },
  ];

  console.log("Menambahkan produk dummy...");
  for (const product of products) {
    const category = await prisma.category.findUnique({
      where: { name: product.categoryName },
    });

    if (category) {
      const existingProduct = await prisma.product.findUnique({
        where: { name: product.name },
      });

      if (!existingProduct) {
        await prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            images: product.images,
            categoryId: category.id,
          },
        });
      }
    }
  }

  console.log("Seeder selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
