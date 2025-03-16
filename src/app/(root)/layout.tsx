import Footer from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
