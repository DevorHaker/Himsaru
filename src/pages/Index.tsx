import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Products } from "@/components/site/Products";
import { Workers } from "@/components/site/Workers";
import { Founders } from "@/components/site/Founders";
import { Distributor } from "@/components/site/Distributor";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <About />
      <Products />
      <Workers />
      <Founders />
      <Distributor />
      <Contact />
      <Footer />
    </main>
  );
};

export default Index;
