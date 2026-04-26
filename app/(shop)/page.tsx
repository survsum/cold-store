import Hero from '@/components/layout/Hero';
import FeaturedProducts from '@/components/product/FeaturedProducts';
import CategoryBanner from '@/components/layout/CategoryBanner';
import ValueProps from '@/components/layout/ValueProps';
import Testimonials from '@/components/layout/Testimonials';
import Newsletter from '@/components/layout/Newsletter';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const products = await prisma.product.findMany({
    take: 4,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="bg-bg-primary min-h-screen">
      <Hero />
      <ValueProps />
      <FeaturedProducts products={products} />
      <CategoryBanner />
      <Testimonials />
      <Newsletter />
    </main>
  );
}
