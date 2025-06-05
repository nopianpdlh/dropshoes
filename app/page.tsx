import HeroSection from "./components/home/HeroSection";
import CategorySection from "./components/home/CategorySection";
import ProductGrid from "./components/home/ProductGrid";
import FilterPanel from "@/components/home/FilterPanel";
import Footer from "./components/layout/Footer";

export const metadata = {
  title: "DropShoes - Find Your Perfect Pair",
  description:
    "Explore top sneaker brands and elevate your style with our curated collection of premium footwear.",
};

export default function HomePage() {
  return (
    <>
      <main>
        <HeroSection />
        <FilterPanel />
        <CategorySection />
        <ProductGrid />
      </main>
      <Footer />
    </>
  );
}
