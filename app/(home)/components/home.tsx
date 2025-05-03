import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/hero-section";
import { CategorySection } from "@/components/category-section";
import { FeaturedProducts } from "@/app/products/components/featured-products";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function HomeComponent() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="flex flex-col min-h-screen">
          <HeroSection />
          <div className="container px-4 py-12 mx-auto space-y-16">
            <CategorySection />
            <FeaturedProducts />
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Ready to upgrade your style?
              </h2>
              <p className="max-w-[600px] text-muted-foreground">
                Discover our latest collections and find your perfect fit.
              </p>
              <Button asChild size="lg">
                <Link href="/products">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Shop Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
