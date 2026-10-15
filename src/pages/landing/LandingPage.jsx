import './landing.css'
import LandingNavbar from './components/LandingNavbar'
import HeroSection from './components/HeroSection'
import TrustBar from './components/TrustBar'
import FeaturesSection from './components/FeaturesSection'
import HowItWorksSection from './components/HowItWorksSection'
import DemoPreviewSection from './components/DemoPreviewSection'
import TestimonialsSection from './components/TestimonialsSection'
import PricingSection from './components/PricingSection'
import FAQSection from './components/FAQSection'
import CTASection from './components/CTASection'
import LandingFooter from './components/LandingFooter'

export default function LandingPage() {
  return (
    <div className="landing-root">
      <LandingNavbar />
      <main>
        {/* 1. Hero — lợi ích chính + CTA app download */}
        <HeroSection />

        {/* 2. Trust bar — 4 trust signals ngang, nền navy */}
        <TrustBar />

        {/* 3. Features — 6 tính năng chính, grid 3×2 */}
        <FeaturesSection />

        {/* 4. How It Works — 3 bước đơn giản */}
        <HowItWorksSection />

        {/* 5. Demo Preview — pronunciation scoring demo */}
        <DemoPreviewSection />

        {/* 6. Testimonials + Stats — social proof */}
        <TestimonialsSection />

        {/* 7. Pricing — 3 gói: Free / Pro / Business */}
        <PricingSection />

        {/* 8. FAQ — 6 câu accordion */}
        <FAQSection />

        {/* 9. CTA cuối — tải app + app store buttons */}
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
