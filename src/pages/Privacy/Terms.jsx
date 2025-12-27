// src/pages/Terms.jsx
import React from "react";
import { Link } from "react-router-dom";

const Terms = () => {
  const terms = [
    {
      heading: "1. Acceptance of Terms",
      body: (
        <p>
          By using this website, you confirm that you are at least 18 years old (or the age of
          majority in your jurisdiction) and have the legal capacity to enter into this agreement.
        </p>
      ),
    },
    {
      heading: "2. Use of the Website",
      body: (
        <p>
          You agree to use this website only for lawful purposes and in compliance with all
          applicable laws and regulations. You must not misuse the website by attempting
          unauthorized access, introducing harmful material, or interfering with its operation.
        </p>
      ),
    },
    {
      heading: "3. User Accounts",
      body: (
        <ul className="list-disc pl-5 space-y-1">
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li>You are responsible for all activity under your account.</li>
          <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
        </ul>
      ),
    },
    {
      heading: "4. Orders & Payments",
      body: (
        <ul className="list-disc pl-5 space-y-1">
          <li>All orders placed through Twayba.com are subject to acceptance and availability.</li>
          <li>Prices are displayed in Euros (€) and include VAT unless otherwise stated.</li>
          <li>We reserve the right to change prices at any time.</li>
          <li>Payment must be made using the methods specified at checkout.</li>
          <li>
            Once an order is placed, you will receive an email confirmation. This does not guarantee
            acceptance. A contract is formed only when we dispatch the goods.
          </li>
        </ul>
      ),
    },
    {
      heading: "5. Shipping & Delivery",
      body: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Delivery times are estimates only and may vary.</li>
          <li>We are not responsible for delays caused by events outside our control (force majeure).</li>
          <li>Risk of loss passes to you upon delivery of the products.</li>
        </ul>
      ),
    },
    {
      heading: "6. Returns & Refunds",
      body: (
        <>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              You have the right to cancel your order within <em>14 days</em> of receiving your items, in
              accordance with EU consumer protection law.
            </li>
            <li>Returned products must be unused, in their original packaging, and in resellable condition.</li>
            <li>
              Certain products (e.g., perishable items, custom orders, hygiene-related items) may not be
              eligible for return unless faulty.
            </li>
            <li>Refunds will be processed using the original payment method within a reasonable timeframe.</li>
          </ul>
          <p className="mt-3">
            Full details can be found in our{" "}
            {/* Use your actual route if different */}
            <Link to="/refund-and-returns" className="text-blue-600 hover:underline">
              Refund &amp; Return Policy
            </Link>
            .
          </p>
        </>
      ),
    },
    {
      heading: "7. Intellectual Property",
      body: (
        <p>
          All content on Twayba.com — including text, graphics, logos, images, and software — is the
          property of Twayba or its licensors and is protected under intellectual property laws. You may
          not copy, reproduce, or distribute any content without prior written consent.
        </p>
      ),
    },
    {
      heading: "8. User Content",
      body: (
        <>
          <p className="mb-2">If you submit reviews, comments, or other content:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              You grant us a non-exclusive, royalty-free license to use and display such content.
            </li>
            <li>You agree not to post unlawful, defamatory, or infringing content.</li>
            <li>We may remove or edit content at our discretion.</li>
          </ul>
        </>
      ),
    },
    {
      heading: "9. Privacy & Data Protection",
      body: (
        <p>
          Your use of the website is also subject to our{" "}
          <Link to="/privacy-policy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
          , which explains how we collect, use, and safeguard your personal data in compliance with the
          <strong> GDPR</strong>.
        </p>
      ),
    },
    {
      heading: "10. Third-Party Links",
      body: (
        <p>
          Our website may contain links to external websites. We are not responsible for the content,
          practices, or policies of those websites. Accessing third-party sites is at your own risk.
        </p>
      ),
    },
    {
      heading: "11. Limitation of Liability",
      body: (
        <>
          <p className="mb-2">To the fullest extent permitted by law:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Twayba.com shall not be liable for any indirect, incidental, or consequential damages
              resulting from your use of the website.
            </li>
            <li>
              Nothing in these Terms excludes liability for fraud, gross negligence, personal injury, or
              other matters that cannot be excluded under applicable law.
            </li>
          </ul>
        </>
      ),
    },
    {
      heading: "12. Indemnification",
      body: (
        <p>
          You agree to indemnify and hold harmless Twayba.com, its affiliates, employees, and partners
          from any claims, damages, liabilities, or expenses arising out of your misuse of the website or
          violation of these Terms.
        </p>
      ),
    },
    {
      heading: "13. Changes to Terms",
      body: (
        <p>
          We may update these Terms at any time. Any changes will be posted on this page with the “Last
          Updated” date. Continued use of the website after changes constitutes acceptance of the updated
          Terms.
        </p>
      ),
    },
    {
      heading: "14. Governing Law & Jurisdiction",
      body: (
        <p>
          These Terms are governed by the laws of <strong>Malta</strong>. Any disputes arising under these Terms
          shall be subject to the exclusive jurisdiction of the courts of Malta.
        </p>
      ),
    },
    {
      heading: "15. Contact Us",
      body: (
        <p>
          If you have any questions about these Terms, please contact us at{" "}
          <a className="text-blue-600 hover:underline" href="mailto:support@twayba.com">
            support@twayba.com
          </a>
          .
        </p>
      ),
    },
  ];

  const toc = terms.map((t) => t.heading);

  return (
    <div className="min-h-screen bg-[#0F1222] w-full">
      <main className="w-full min-h-screen bg-white px-4 sm:px-6 lg:px-8 flex flex-col">
        <div className="w-full max-w-5xl mx-auto py-10 lg:py-14 flex-1">
          {/* Header */}
          <header className="mb-8 lg:mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F1222] tracking-tight text-center">
              Terms of Use
            </h1>
            <p className="text-gray-500 text-sm sm:text-base text-center mt-2">
              Last updated: September 1, 2025
            </p>
          </header>

          {/* Quick TOC */}
          <nav
            aria-label="Table of contents"
            className="mb-8 border border-gray-200 rounded-xl p-4 bg-gray-50"
          >
            <p className="text-gray-700 font-semibold mb-2">On this page</p>
            <ol className="grid gap-2 sm:grid-cols-2 list-decimal pl-5">
              {toc.map((item) => (
                <li key={item} className="truncate">
                  <a
                    href={`#${item.replace(/\s+/g, "-").toLowerCase()}`}
                    className="text-blue-700 hover:underline"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Sections */}
          <div className="space-y-8">
            {terms.map(({ heading, body }) => {
              const id = heading.replace(/\s+/g, "-").toLowerCase();
              return (
                <section key={heading} id={id}>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0F1222] mb-2">{heading}</h2>
                  <div className="text-gray-700 text-base leading-relaxed">{body}</div>
                  <hr className="my-6 border-dashed border-gray-200" />
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terms;
