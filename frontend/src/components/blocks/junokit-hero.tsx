import { HeroSection } from "@/components/blocks/hero-section-dark"

function JunokitHero() {
  return (
    <HeroSection
      title="🪐 Welcome to Junokit"
      subtitle={{
        regular: "Your intelligent ",
        gradient: "AI assistant",
      }}
      description="Get instant help with any task or question. From coding and analysis to creative projects and problem-solving - your AI companion is ready to assist with enterprise-grade reliability."
      ctaText="Start Chatting"
      ctaHref="/chat"
      bottomImage={undefined}
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