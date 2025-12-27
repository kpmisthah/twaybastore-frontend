import React from "react";

const Careers = () => {
  return (
    <div className="min-h-screen bg-[#1A1F31] w-full">
      <main className="w-full min-h-screen bg-white px-4 sm:px-0 flex flex-col">
        <div className="w-full max-w-3xl mx-auto py-10 flex-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1F31] mb-2 text-center tracking-tight">
            Careers
          </h1>
          <p className="text-gray-500 text-base sm:text-lg text-center mb-8">
            Join our growing team
          </p>
          <div className="space-y-7">
            <section>
              <h2 className="text-xl font-bold text-[#1A1F31] mb-1">Work with Us</h2>
              <p className="text-gray-700 text-base leading-relaxed">
                At Twayba.com, we believe in building a talented, passionate team that thrives on creativity and innovation. If you want to be part of a fast-growing e-commerce company and help shape the future of online shopping, we want to hear from you!
              </p>
              <hr className="my-6 border-dashed border-gray-200" />
            </section>
            <section>
              <h2 className="text-xl font-bold text-[#1A1F31] mb-1">Open Positions</h2>
              <p className="text-gray-700 text-base leading-relaxed">
                We’re always looking for great people in these areas:
              </p>
              <ul className="text-gray-700 text-base leading-relaxed list-disc list-inside space-y-1">
                <li>Customer Support</li>
                <li>Product Management</li>
                <li>Marketing & Content</li>
                <li>Logistics & Operations</li>
                <li>Engineering & Development</li>
              </ul>
              <hr className="my-6 border-dashed border-gray-200" />
            </section>
            <section>
              <h2 className="text-xl font-bold text-[#1A1F31] mb-1">How to Apply</h2>
              <p className="text-gray-700 text-base leading-relaxed">
                Please send your CV and a brief cover letter to{" "}
                <a
                  href="mailto:career@twayba.com"
                  className="text-[#1A1F31] underline"
                >
                  career@twayba.com
                </a>{" "}
                with your area of interest in the subject line.
              </p>
            </section>
          </div>
        </div>
      </main>
      <footer className="w-full bg-white text-gray-400 text-center text-xs py-4 border-t border-gray-100">
        &copy; {new Date().getFullYear()} Twayba.com. All rights reserved.
      </footer>
    </div>
  );
};

export default Careers;
