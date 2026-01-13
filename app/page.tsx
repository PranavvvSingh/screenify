"use client";

import Link from "next/link";
import { SignInButtons } from "@/components/auth/sign-in-buttons";
import {
  Brain,
  Zap,
  Target
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Questions",
      description: "Generate role-specific assessments from job descriptions automatically",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Screen candidates in minutes with instant evaluation and scoring",
    },
    {
      icon: Target,
      title: "Precision Hiring",
      description: "Identify top talent with verification questions that detect fraud",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between">
          <Link href="/" className="font-pacifico text-3xl md:text-4xl text-gradient-primary leading-tight">
            Screenify
          </Link>
          <SignInButtons />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Layered background: grid + dots + glow */}
        <div className="absolute inset-0 hero-grid" />
        <div className="absolute inset-0 hero-dots" />
        <div className="absolute inset-0 hero-glow" />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span className="text-sm font-medium text-primary">AI-Powered Screening</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-foreground">Hire Smarter with</span>
              <br />
              <span className="text-gradient-primary">Intelligent Screening</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform your hiring process with AI-generated assessments that save time,
              reduce bias, and identify top talent with precision.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <SignInButtons variant="cta" />
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need to screen better
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From job description to hire decision, Screenify handles the heavy lifting.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-8 rounded-2xl bg-card shadow-soft-md hover-lift"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to transform your hiring?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of recruiters who have streamlined their screening process with Screenify.
          </p>
        </div>
      </section>


      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="font-pacifico text-xl text-primary">Screenify</span>
          <span className="text-sm text-muted-foreground">
            AI-Powered Candidate Screening
          </span>
        </div>
      </footer>
    </div>
  );
}
