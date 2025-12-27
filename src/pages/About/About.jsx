import React, { useEffect } from "react";

const TEAM_MEMBERS = [
  {
    name: "Isaac",
    role: "Chief Executive Officer",
    description: "Leads Twayba with vision, strategy, and innovation.",
    image: "https://www.twayba.com/images/team/isaac.jpg",
  },
  {
    name: "Kostia",
    role: "Chief Operating Officer",
    description: "Oversees operations and ensures company growth.",
    image: "https://www.twayba.com/images/team/kostia.jpg",
  },
  {
    name: "Abdul Ahad S",
    role: "Chief Technical Officer",
    description: "Leads the tech team and drives digital transformation.",
    image: "https://cdn.discordapp.com/attachments/1393535274079883316/1442088964684124200/Abdulahad.png?ex=69242981&is=6922d801&hm=7f9df410f21ea8b2097010e67a85a76c91c89b86f5c537dcf4468f4d1962ca49&",
  },
  {
    name: "Sultan",
    role: "Marketing Director",
    description: "Drives marketing campaigns and brand visibility.",
    image: "https://www.twayba.com/images/team/sultan.jpg",
  },
  {
    name: "Emma",
    role: "Administrator",
    description: "Oversees daily operations and admin processes.",
    image: "https://www.twayba.com/images/team/emma.jpg",
  },
  {
    name: "Emma Wang",
    role: "Purchasing Officer",
    description: "Manages procurement and supplier relations.",
    image: "https://www.twayba.com/images/team/emma-wang.jpg",
  },
  {
    name: "Muhammed Aslamshah",
    role: "Head Programmer",
    description: "Develops core systems and ensures code quality.",
    image: "https://www.twayba.com/images/team/aslamshah.jpg",
  },
  {
    name: "Enrique",
    role: "Head of Sales",
    description: "Leads the sales team to achieve growth and results.",
    image: "https://www.twayba.com/images/team/enrique.jpg",
  },
  {
    name: "Chris",
    role: "Project Manager",
    description: "Manages projects and ensures timely delivery.",
    image: "https://www.twayba.com/images/team/chris.jpg",
  },
];

export default function About() {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Twayba",
      url: "https://www.twayba.com",
      logo: "https://www.twayba.com/logo.png",
      description:
        "Twayba.com is a modern Malta-based eCommerce brand offering fitness, home, gadgets, and outdoor products with same-day local delivery.",
      sameAs: [
        "https://www.instagram.com/twayba",
        "https://www.facebook.com/twayba",
        "https://www.linkedin.com/company/twayba",
      ],
      employee: TEAM_MEMBERS.map((m) => ({
        "@type": "Person",
        name: m.name,
        jobTitle: m.role,
        image: m.image,
        description: m.description,
      })),
    };

    // inject structured data script
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white text-gray-900 font-sans"
      itemScope
      itemType="https://schema.org/Organization"
    >
      {/* Hero Section */}
      <header className="relative bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
        <div className="max-w-5xl mx-auto py-20 px-6 text-center">
          <h1
            itemProp="name"
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4"
          >
            About <span className="text-yellow-300">Twayba.com</span>
          </h1>
          <p
            itemProp="description"
            className="text-lg md:text-xl font-light max-w-3xl mx-auto leading-relaxed opacity-90"
          >
            Twayba.com is a modern online marketplace in Malta, connecting people
            with quality products across multiple categories. We believe in
            innovation, trust, and delivering exceptional customer experiences.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto w-full px-6 py-16 space-y-16">
        {/* Who We Are */}
        <section itemProp="about" className="space-y-4">
          <h2 className="text-3xl font-semibold text-gray-800">Who We Are</h2>
          <p className="text-lg leading-relaxed text-gray-600">
            Twayba.com is Malta’s modern online marketplace, created to make
            shopping simple, trustworthy, and enjoyable. We offer a wide range
            of products including Home & Kitchen, Fitness, Gadgets, Car
            Accessories, and more.
          </p>
        </section>

        {/* Mission */}
        <section className="space-y-4">
          <h2 className="text-3xl font-semibold text-gray-800">Our Mission</h2>
          <p className="text-lg leading-relaxed text-gray-600">
            Our mission is to connect people in Malta and beyond with the
            products they love while providing excellent service and a safe,
            enjoyable shopping experience.
          </p>
        </section>

        {/* Why Shop */}
        <section className="space-y-4">
          <h2 className="text-3xl font-semibold text-gray-800">
            Why Shop With Us?
          </h2>
          <ul className="list-disc pl-6 text-lg leading-relaxed text-gray-600 space-y-2">
            <li>Curated product selection</li>
            <li>Fast shipping and easy returns</li>
            <li>Dedicated support team</li>
            <li>Safe and secure payments</li>
            <li>Exciting deals and offers</li>
          </ul>
        </section>

        {/* Team */}
        <section className="space-y-10">
          <h2 className="text-3xl font-semibold text-gray-800 text-center">
            Meet Our Team
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {TEAM_MEMBERS.map((member, index) => (
              <article
                key={index}
                itemScope
                itemType="https://schema.org/Person"
                className="p-6 bg-white border border-gray-100 rounded-xl shadow-md hover:shadow-xl transition duration-300 flex flex-col items-center text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  loading="lazy"
                  decoding="async"
                  className="w-32 h-32 md:w-36 md:h-36 object-cover rounded-full ring-2 ring-indigo-200 shadow-lg mb-5 [image-rendering:high-quality]"
                  itemProp="image"
                />
                <h3
                  itemProp="name"
                  className="text-xl font-semibold text-gray-900"
                >
                  {member.name}
                </h3>
                <p
                  itemProp="jobTitle"
                  className="text-indigo-600 font-medium mb-2"
                >
                  {member.role}
                </p>
                <p
                  itemProp="description"
                  className="text-gray-600 text-sm leading-relaxed"
                >
                  {member.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
