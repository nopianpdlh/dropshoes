const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcrypt");

const prisma = new PrismaClient();

interface ProductSeed {
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categoryName: string;
  sizes: string[];
  colors: string[];
}

async function main() {
  // Create main categories (brands)
  const brands = [
    { name: "Adidas" },
    { name: "Nike" },
    { name: "New Balance" },
  ];

  const createdBrands = await Promise.all(
    brands.map((brand) =>
      prisma.category.create({
        data: brand,
      })
    )
  );

  // Create subcategories for each brand
  const subcategories = ["Men", "Women", "Kids", "Sport"];

  for (const brand of createdBrands) {
    await Promise.all(
      subcategories.map((subName) =>
        prisma.category.create({
          data: {
            name: `${subName} - ${brand.name}`,
            parent: {
              connect: { id: brand.id },
            },
          },
        })
      )
    );
  }

  // Buat sizes
  console.log("Menambahkan ukuran sepatu...");
  const sizes = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];
  const createdSizes = [];
  for (const size of sizes) {
    const createdSize = await prisma.size.upsert({
      where: { name: size },
      update: {},
      create: { name: size },
    });
    createdSizes.push(createdSize);
  }

  // Buat colors
  console.log("Menambahkan warna...");
  const colors = ["Black", "White", "Red", "Blue", "Grey"];
  const createdColors = [];
  for (const color of colors) {
    const createdColor = await prisma.color.upsert({
      where: { name: color },
      update: {},
      create: { name: color },
    });
    createdColors.push(createdColor);
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
  console.log("Menambahkan produk dummy...");
  const products: ProductSeed[] = [
    {
      name: "Adidas Ultraboost",
      description:
        "Sepatu lari dengan teknologi Boost untuk kenyamanan maksimal",
      price: 2499000,
      stock: 30,
      images: [
        "https://res.cloudinary.com/djuiqpinc/image/upload/v1747410568/new1_gwoxyv.jpg",
      ],
      categoryName: "Sport - Adidas",
      sizes: ["40", "41", "42", "43"],
      colors: ["Black", "White", "Grey"],
    },
    {
      name: "Nike Air Max",
      description: "Sepatu lifestyle dengan bantalan udara yang nyaman",
      price: 1899000,
      stock: 50,
      images: [
        "https://res.cloudinary.com/djuiqpinc/image/upload/v1747410568/new1_gwoxyv.jpg",
      ],
      categoryName: "Sport - Nike",
      sizes: ["39", "40", "41", "42"],
      colors: ["Red", "Blue", "White"],
    },
    {
      name: "New Balance 574",
      description: "Sepatu klasik dengan desain retro yang stylish",
      price: 1299000,
      stock: 25,
      images: [
        "https://res.cloudinary.com/djuiqpinc/image/upload/v1747410568/new1_gwoxyv.jpg",
      ],
      categoryName: "Sport - New Balance",
      sizes: ["38", "39", "40", "41"],
      colors: ["Grey", "Black", "Blue"],
    },
  ];

  const createdProducts = [];
  for (const product of products) {
    // Cari kategori berdasarkan nama
    const category = await prisma.category.findFirst({
      where: {
        name: product.categoryName,
        parentId: null,
      },
    });

    if (category) {
      const existingProduct = await prisma.product.findUnique({
        where: { name: product.name },
      });

      if (!existingProduct) {
        const selectedSizes = createdSizes.filter((size) =>
          product.sizes.includes(size.name)
        );

        const selectedColors = createdColors.filter((color) =>
          product.colors.includes(color.name)
        );

        const createdProduct = await prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            images: product.images,
            categoryId: category.id,
            sizes: {
              connect: selectedSizes.map((size) => ({ id: size.id })),
            },
            colors: {
              connect: selectedColors.map((color) => ({ id: color.id })),
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
          customerName: user.name || "Nama tidak tersedia",
          customerPhone: "08123456789",
          items: {
            create: orderItems,
          },
        },
      });
    }
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
