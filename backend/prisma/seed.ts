import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@wearyourart.com' },
    update: {},
    create: {
      email: 'admin@wearyourart.com',
      password: hashedPassword,
      name: 'Admin User',
    },
  });
  console.log('Created admin:', admin.email);

  // Create categories
  const categories = [
    {
      name: 'Hoodies',
      slug: 'hoodies',
      description: 'Premium customizable hoodies for every style',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
    },
    {
      name: 'T-Shirts',
      slug: 't-shirts',
      description: 'Classic t-shirts perfect for custom designs',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    },
    {
      name: 'Sweatshirts',
      slug: 'sweatshirts',
      description: 'Comfortable sweatshirts for casual wear',
      image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800',
    },
    {
      name: 'Jackets',
      slug: 'jackets',
      description: 'Stylish jackets with custom options',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
    },
    {
      name: 'Pants',
      slug: 'pants',
      description: 'Joggers and pants for complete outfits',
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Caps, bags, and more to complete your look',
      image: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }
  console.log('Created categories');

  // Get category IDs
  const hoodiesCategory = await prisma.category.findUnique({
    where: { slug: 'hoodies' },
  });
  const tshirtsCategory = await prisma.category.findUnique({
    where: { slug: 't-shirts' },
  });

  const colors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Navy', hex: '#1e3a5f' },
    { name: 'Gray', hex: '#6b7280' },
    { name: 'Red', hex: '#dc2626' },
    { name: 'Forest Green', hex: '#166534' },
    { name: 'Purple', hex: '#7c3aed' },
    { name: 'Sand', hex: '#d4a574' },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

  // Create products
  const products = [
    {
      name: 'Classic Hoodie',
      slug: 'classic-hoodie',
      description:
        'Our signature hoodie, perfect for everyday wear. Made with premium cotton blend for ultimate comfort.',
      basePrice: 79.99,
      customizationPrice: 15.0,
      images: [
        'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
        'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800',
      ],
      colors: JSON.stringify(colors),
      sizes,
      features: [
        '100% Premium Cotton',
        'Kangaroo pocket',
        'Double-lined hood',
        'Ribbed cuffs and hem',
      ],
      categoryId: hoodiesCategory!.id,
      inStock: true,
      customizable: true,
    },
    {
      name: 'Premium Heavyweight Hoodie',
      slug: 'premium-heavyweight-hoodie',
      description:
        'Extra thick and warm hoodie for colder days. Heavy-duty construction with premium materials.',
      basePrice: 99.99,
      customizationPrice: 15.0,
      images: [
        'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800',
      ],
      colors: JSON.stringify(colors.slice(0, 5)),
      sizes,
      features: [
        '400 GSM heavyweight cotton',
        'Oversized fit',
        'Double-stitched seams',
        'Premium brushed fleece interior',
      ],
      categoryId: hoodiesCategory!.id,
      inStock: true,
      customizable: true,
    },
    {
      name: 'Zip-Up Hoodie',
      slug: 'zip-up-hoodie',
      description:
        'Versatile zip-up design with a modern fit. Easy on, easy off, always stylish.',
      basePrice: 89.99,
      customizationPrice: 15.0,
      images: [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
      ],
      colors: JSON.stringify(colors),
      sizes,
      features: [
        'YKK metal zipper',
        'Split kangaroo pockets',
        'Soft cotton blend',
        'Adjustable drawstring hood',
      ],
      categoryId: hoodiesCategory!.id,
      inStock: true,
      customizable: true,
    },
    {
      name: 'Classic T-Shirt',
      slug: 'classic-t-shirt',
      description:
        'The perfect canvas for your custom design. Soft, breathable, and comfortable.',
      basePrice: 34.99,
      customizationPrice: 10.0,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      ],
      colors: JSON.stringify(colors),
      sizes,
      features: [
        '100% Ring-spun cotton',
        'Pre-shrunk fabric',
        'Shoulder-to-shoulder taping',
        'Seamless collar',
      ],
      categoryId: tshirtsCategory!.id,
      inStock: true,
      customizable: true,
    },
    {
      name: 'Premium T-Shirt',
      slug: 'premium-t-shirt',
      description:
        'Elevated basics with a luxurious feel. Heavier weight cotton for a premium drape.',
      basePrice: 44.99,
      customizationPrice: 10.0,
      images: [
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
      ],
      colors: JSON.stringify(colors.slice(0, 6)),
      sizes,
      features: [
        '200 GSM Supima cotton',
        'Relaxed fit',
        'Reinforced neckline',
        'Side-seamed construction',
      ],
      categoryId: tshirtsCategory!.id,
      inStock: true,
      customizable: true,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        ...product,
        colors: JSON.parse(product.colors as string),
      },
      create: {
        ...product,
        colors: JSON.parse(product.colors as string),
      },
    });
  }
  console.log('Created products');

  console.log('Seeding completed!');
  console.log('\nAdmin credentials:');
  console.log('Email: admin@wearyourart.com');
  console.log('Password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
