import WeeklyDeals from "../components/WeeklyDeals";
import BlackFridayDeals from "../components/BlackFridayDeals";
import BrowseCategories from "../components/CategorySelector";
import HeroSection from "../components/HeroSection";
import Testimonials from "../components/Testimonials";

const Home = () => {
  return (
    <div>
      <HeroSection />
      <hr className="text-gray-200 mt-10" />
      <BrowseCategories />
      <hr className="text-gray-200" />
      <Testimonials/>
      {/* <MostSelledItems /> */}
      {/* <hr className="text-gray-200" /> */}
      <BlackFridayDeals />
      <WeeklyDeals />
    </div>
  );
};

export default Home;
