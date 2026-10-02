"use client";
import { useAuth } from "../../context/AuthContext";
import Hero from "../../components/home/Hero";
import HowItWorks from "../../components/home/HowItWorks";
import Occasions from "../../components/home/Occasions";
import Features from "../../components/home/Features";
import CallToAction from "../../components/home/CallToAction";

export default function Home() {
  const { token, loading } = useAuth();
  const loggedIn = !loading && !!token;
  const ctaHref = loggedIn ? "/make-poster" : "/register";
  const ctaText = loggedIn ? "Make a Poster" : "Get Started";

  return (
    <div>
      <Hero ctaHref={ctaHref} ctaText={ctaText} />
      <HowItWorks />
      <Occasions ctaHref={ctaHref} />
      <Features />
      <CallToAction ctaHref={ctaHref} ctaText={ctaText} />
    </div>
  );
}