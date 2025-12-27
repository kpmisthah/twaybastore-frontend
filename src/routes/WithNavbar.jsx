import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Snakebar from "../components/Snakebar";
import TopBanner from "../components/TopBanner";

const WithNavbar = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopBanner/>
      <Navbar />
      <Snakebar/>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default WithNavbar;

