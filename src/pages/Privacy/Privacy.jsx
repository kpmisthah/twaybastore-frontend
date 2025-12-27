const policy = [
  {
    heading: "1. Introduction",
    body: "Twayba.com is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website.",
  },
  {
    heading: "2. Information We Collect",
    body: "We may collect personal information such as your name, email address, shipping address, payment details, and usage data when you use our services or interact with our website.",
  },
  {
    heading: "3. How We Use Your Information",
    body: "Your information is used to provide and improve our services, process your orders, communicate with you, and ensure website security. We may also use data for analytics and marketing purposes.",
  },
  {
    heading: "4. Sharing Your Information",
    body: "We do not sell your personal information. We may share your data with trusted third parties to provide our services, comply with legal obligations, or protect our rights.",
  },
  {
    heading: "5. Cookies & Tracking",
    body: "Our website uses cookies and similar tracking technologies to enhance your experience. You can adjust your browser settings to refuse cookies, but some features may not work as intended.",
  },
  {
    heading: "6. Data Security",
    body: "We implement appropriate security measures to protect your information. However, no method of transmission over the Internet is 100% secure.",
  },
  {
    heading: "7. Your Rights",
    body: (
      <>
        You have the right to access, correct, or delete your personal
        information. Contact us at{" "}
        <a
          href="mailto:support@twayba.com"
          className="underline text-[#1A1F31]"
        >
          support@twayba.com
        </a>{" "}
        to exercise your rights.
      </>
    ),
  },
  {
    heading: "8. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Updates will be posted on this page. Continued use of the site indicates your acceptance of changes.",
  },
  {
    heading: "9. Contact Us",
    body: (
      <>
        If you have questions or concerns about our Privacy Policy, please
        contact us at{" "}
        <a
          href="mailto:support@twayba.com"
          className="underline text-[#1A1F31]"
        >
          support@twayba.com
        </a>
        .
      </>
    ),
  },
];

const Privacy = () => (
  <div className="min-h-screen bg-[#1A1F31] w-full">
    <main className="w-full min-h-screen bg-white px-4 sm:px-0 flex flex-col">
      <div className="w-full max-w-3xl mx-auto py-10 flex-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1F31] mb-2 text-center tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-gray-500 text-base sm:text-lg text-center mb-8">
          Last updated: July 20, 2025
        </p>
        <article className="space-y-7" aria-labelledby="privacy-heading">
          {policy.map(({ heading, body }, idx) => (
            <section key={heading}>
              <h2 className="text-xl font-bold text-[#1A1F31] mb-1">
                {heading}
              </h2>
              <p className="text-gray-700 text-base leading-relaxed">{body}</p>
              {idx < policy.length - 1 && (
                <hr className="my-6 border-dashed border-gray-200" />
              )}
            </section>
          ))}
        </article>
      </div>
    </main>
    <footer className="w-full bg-white text-gray-400 text-center text-xs py-4 border-t border-gray-100">
      &copy; {new Date().getFullYear()} Twayba.com. All rights reserved.
    </footer>
  </div>
);

export default Privacy;
