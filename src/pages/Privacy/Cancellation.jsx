import React from "react";

const POLICY_URL = "https://twayba.com/cancellation"; // Update to your live URL

const policy = [
  {
    heading: "1. Order Cancellation",
    body: (
      <>
        Customers may <strong>cancel their order within 2 hours</strong> of placing it. After this 2-hour window, cancellation is no longer possible as your order will be packed and shipped promptly.<br /><br />
        <strong>How to Cancel:</strong> To cancel your order within 2 hours, log in to your account and select the order you wish to cancel, or contact our support team at{" "}
        <a
          href="mailto:support@twayba.com"
          className="text-[#1A1F31] underline"
        >
          support@twayba.com
        </a>
        .<br /><br />
        <strong>Note:</strong> Once 2 hours have passed, your order is in process for dispatch and cannot be canceled.
      </>
    ),
  },
  {
    heading: "2. Returns",
    body: (
      <>
        If you are not completely satisfied with your purchase, you may request a return within <strong>14 days</strong> of receiving your order, subject to our returns policy.<br /><br />
        Products must be unused, in original packaging, and in resalable condition.<br /><br />
        To initiate a return, please contact our support team at{" "}
        <a
          href="mailto:support@twayba.com"
          className="text-[#1A1F31] underline"
        >
          support@twayba.com
        </a>
        .
      </>
    ),
  },
  {
    heading: "3. Refunds",
    body: (
      <>
        Refunds for returned products (once approved) will be processed to your original payment method within <strong>5-7 business days</strong> after we receive and inspect the items.<br /><br />
        Shipping charges are non-refundable unless the return is due to our error or a defective product.
      </>
    ),
  },
  {
    heading: "4. Contact Us",
    body: (
      <>
        If you have any questions about our cancellation or returns policy, please email us at{" "}
        <a
          href="mailto:support@twayba.com"
          className="text-[#1A1F31] underline"
        >
          support@twayba.com
        </a>
        .
      </>
    ),
  },
];

const CancellationReturns = () => (
  <div className="min-h-screen bg-[#1A1F31] w-full">
   
    <main className="w-full min-h-screen bg-white px-4 sm:px-0 flex flex-col">
      <div className="w-full max-w-3xl mx-auto py-10 flex-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1F31] mb-2 text-center tracking-tight">
          Cancellation & Returns Policy
        </h1>
        <p className="text-gray-500 text-base sm:text-lg text-center mb-8">
          Last updated: July 20, 2025
        </p>
        <article className="space-y-7" aria-labelledby="cancellation-heading">
          {policy.map(({ heading, body }, idx) => (
            <section key={heading}>
              <h2 className="text-xl font-bold text-[#1A1F31] mb-1">{heading}</h2>
              <div className="text-gray-700 text-base leading-relaxed">{body}</div>
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

export default CancellationReturns;
