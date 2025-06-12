import { HeroSection } from "@/components/blocks/hero-section-dark"
import AnimatedTextCycle from "@/components/ui/animated-text-cycle"

function JunokitHero() {
  const workAssistantWords = [
    "assistant",
    "messenger",
    "companion", 
    "guide",
    "helper",
    "advisor",
    "partner",
    "consultant"
  ];

  return (
    <HeroSection
      title="🪐 Welcome to Junokit"
      subtitle={{
        regular: "Your intelligent AI ",
        gradient: (
          <AnimatedTextCycle 
            words={workAssistantWords}
            interval={3000}
            className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-300 dark:to-orange-200"
          />
        ),
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