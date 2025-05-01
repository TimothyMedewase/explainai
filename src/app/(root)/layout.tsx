import Footer from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { FileProvider } from "@/lib/file-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FileProvider>
      <div>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
    </FileProvider>
  );
}
