import React from "react";
import Navbar from "../../components/layout/Navbar";
import Hero from "../../components/landing/Hero";
import FeaturesGrid from "../../components/landing/FeaturesGrid";
import HowItWorks from "../../components/landing/HowItWorks";
import AboutSection from "../../components/landing/AboutSection";
import Testimonials from "../../components/landing/Testimonials";
import Footer from "../../components/landing/Footer";
import "../../assets/styles/landing.css";

export default function Home() {
  return (
    <div className="landing-page">
      <Navbar />
      <main>
        <Hero />
        <FeaturesGrid />
        <HowItWorks />
        <AboutSection />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
