import { HeroSection } from "@/components/blocks/hero-section-dark"

function JunokitHero() {
  return (
    <HeroSection
      title="🪐 Welcome to Junokit"
      subtitle={{
        regular: "Transform your workflow with ",
        gradient: "Jupiter-powered AI assistance",
      }}
      description="Streamline your development, operations, QA, sales, and media workflows with our intelligent AI assistant. Personalized for your role, powered by enterprise-grade infrastructure."
      ctaText="Get Started Free"
      ctaHref="/signup"
      bottomImage={{
        light: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop&crop=center",
        dark: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&h=600&fit=crop&crop=center",
      }}
      gridOptions={{
        angle: 65,
        opacity: 0.3,
        cellSize: 50,
        lightLineColor: "#4a4a4a",
        darkLineColor: "#2a2a2a",
      }}
    />
  )
}

export { JunokitHero } 