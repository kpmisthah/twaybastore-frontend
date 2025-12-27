// TopBanner.jsx
import { FaShippingFast } from "react-icons/fa";

const TopBanner = () => {

  return (
    <div className="sticky top-0 z-50 w-full bg-gray-900 text-white p-2 text-sm">
      <div className="flex items-center justify-center py-2 px-4 h-10">
        <p
          className="transition-opacity flex flex-row gap-2 items-center font-[500] text-[16px] duration-500 ease-in-out opacity-100 animate-fade"
        >
          <FaShippingFast />
         Free delivery above €35
        </p>
      </div>

      <style jsx>{`
        @keyframes fade {
          0% {
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        .animate-fade {
          animation: fade 4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default TopBanner;
