import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import LandingNavbar from './components/LandingNavbar'
import HeroSection from './components/HeroSection'
import TrustBar from './components/TrustBar'
import FeaturesSection from './components/FeaturesSection'
import HowItWorksSection from './components/HowItWorksSection'
import DemoPreviewSection from './components/DemoPreviewSection'
import TestimonialsSection from './components/TestimonialsSection'
import PricingSection from './components/PricingSection'
import StatsSection from './components/StatsSection'
import CTASection from './components/CTASection'
import LandingFooter from './components/LandingFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white overflow-x-hidden">
      <LandingNavbar />
      <main>
        <HeroSection />
        <TrustBar />
        <FeaturesSection />
        <HowItWorksSection />
        <DemoPreviewSection />
        <TestimonialsSection />
        <PricingSection />
        <StatsSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
