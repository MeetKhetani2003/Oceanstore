import { Hero } from "@/components/store/Hero";
import { AssuranceStrip } from "@/components/store/AssuranceStrip";
import { Categories } from "@/components/store/Categories";
import { Products } from "@/components/store/Products";
import { Editorial } from "@/components/store/Editorial";
import { Trust } from "@/components/store/Trust";
import { CTASection } from "@/components/store/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AssuranceStrip />
      <Categories />
      <Products />
      <Editorial />
      <Trust />
      <CTASection />
    </>
  );
}
