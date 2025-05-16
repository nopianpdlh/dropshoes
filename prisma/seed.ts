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

  // Buat sizes
  console.log("Menambahkan ukuran sepatu...");
  const sizes = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];
  for (const size of sizes) {
    await prisma.size.upsert({
      where: { name: size },
      update: {},
      create: { name: size },
    });
  }

  // Buat colors
  console.log("Menambahkan warna...");
  const colors = ["Black", "White", "Red", "Blue", "Grey"];
  for (const color of colors) {
    await prisma.color.upsert({
      where: { name: color },
      update: {},
      create: { name: color },
    });
  }

  // Buat beberapa user dummy
  console.log("Membuat user dummy...");
  const users = [
    {
      email: "admin@example.com",
      name: "Admin",
      password: "admin123",
      role: "ADMIN",
    },
    {
      email: "john@example.com",
      name: "John Doe",
      password: "password123",
      role: "USER",
    },
    {
      email: "jane@example.com",
      name: "Jane Smith",
      password: "password123",
      role: "USER",
    },
  ];

  for (const userData of users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: await hash(userData.password, 10),
          role: userData.role as "ADMIN" | "USER",
        },
      });
    }
  }

  // Buat beberapa produk dummy
  const products = [
    {
      name: "Nike Air Max 270",
      description: "Sepatu lifestyle dengan bantalan udara yang nyaman",
      price: 1899000,
      stock: 50,
      images: [
        "https://res.cloudinary.com/djuiqpinc/image/upload/v1747410568/new1_gwoxyv.jpg",
      ],
      categoryName: "Sneakers",
      sizes: ["40", "41", "42", "43"],
      colors: ["Black", "White", "Red"],
    },
    {
      name: "Adidas Ultraboost",
      description:
        "Sepatu lari dengan teknologi Boost untuk kenyamanan maksimal",
      price: 2499000,
      stock: 30,
      images: [
        "https://res.cloudinary.com/djuiqpinc/image/upload/v1747410568/new1_gwoxyv.jpg",
      ],
      categoryName: "Running",
      sizes: ["39", "40", "41", "42"],
      colors: ["Blue", "Black", "Grey"],
    },
    {
      name: "Nike Zoom Freak",
      description: "Sepatu basket signature dari Giannis Antetokounmpo",
      price: 1699000,
      stock: 25,
      images: [
        "https://res.cloudinary.com/djuiqpinc/image/upload/v1747410568/new1_gwoxyv.jpg",
      ],
      categoryName: "Basketball",
      sizes: ["42", "43", "44"],
      colors: ["Black", "White"],
    },
  ];

  console.log("Menambahkan produk dummy...");
  const createdProducts: any[] = [];
  for (const product of products) {
    const category = await prisma.category.findUnique({
      where: { name: product.categoryName },
    });

    if (category) {
      const existingProduct = await prisma.product.findUnique({
        where: { name: product.name },
      });

      if (!existingProduct) {
        const sizes = await prisma.size.findMany({
          where: {
            name: {
              in: product.sizes,
            },
          },
        });

        const colors = await prisma.color.findMany({
          where: {
            name: {
              in: product.colors,
            },
          },
        });

        const createdProduct = await prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            images: product.images,
            categoryId: category.id,
            sizes: {
              connect: sizes.map((size: { id: string }) => ({ id: size.id })),
            },
            colors: {
              connect: colors.map((color: { id: string }) => ({
                id: color.id,
              })),
            },
          },
        });
        createdProducts.push(createdProduct);
      }
    }
  }

  // Buat Cart untuk user
  console.log("Membuat cart untuk users...");
  const regularUsers = await prisma.user.findMany({
    where: { role: "USER" },
  });

  for (const user of regularUsers) {
    const existingCart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!existingCart && createdProducts.length > 0) {
      const cart = await prisma.cart.create({
        data: {
          userId: user.id,
        },
      });

      // Tambahkan beberapa item ke cart
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: createdProducts[0].id,
          quantity: 1,
          size: "40",
          color: "Black",
        },
      });
    }
  }

  // Buat Order dummy
  console.log("Membuat order dummy...");
  for (const user of regularUsers) {
    if (createdProducts.length > 0) {
      const orderItems = [
        {
          productId: createdProducts[0].id,
          quantity: 1,
          price: createdProducts[0].price,
          size: "41",
          color: "Black",
        },
        {
          productId: createdProducts[1].id,
          quantity: 2,
          price: createdProducts[1].price,
          size: "42",
          color: "Blue",
        },
      ];

      const total = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      await prisma.order.create({
        data: {
          userId: user.id,
          total: total,
          status: "DELIVERED",
          address: "Jl. Contoh No. 123, Jakarta",
          items: {
            create: orderItems,
          },
        },
      });
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
