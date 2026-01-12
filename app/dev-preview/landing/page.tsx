"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";
import { 
  Brain, 
  Zap, 
  Target, 
  ArrowRight, 
  Shield, 
  BarChart3,
  Clock,
  CheckCircle2
} from "lucide-react";

function SignInButton() {
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/api/auth-callback",
    });
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      size="lg"
      className="h-12 px-8 text-base font-medium bg-card text-foreground border border-border shadow-soft-md hover:shadow-soft-lg hover:border-primary/20 transition-all cursor-pointer"
    >
      <FcGoogle className="h-5 w-5 mr-3" />
      Continue with Google
    </Button>
  );
}

export default function LandingPreview() {
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

  const benefits = [
    {
      icon: Shield,
      title: "Anti-Cheat Protection",
      description: "Fullscreen mode, tab detection, and proctoring ensure test integrity",
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Compare candidates side-by-side with comprehensive scoring breakdowns",
    },
    {
      icon: Clock,
      title: "Time-Efficient",
      description: "Reduce screening time by 80% while improving candidate quality",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dev-preview" className="font-pacifico text-2xl text-gradient-primary">
            Screenify
          </Link>
          <SignInButton />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02]" />
        
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
              <Button 
                size="lg" 
                className="h-12 px-8 text-base font-medium shadow-soft-md hover:shadow-soft-lg transition-shadow"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="h-12 px-8 text-base font-medium"
              >
                Watch Demo
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Free for small teams</span>
              </div>
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

      {/* How it Works */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Simple, powerful workflow
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get from job posting to qualified candidates in three easy steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Upload JD", description: "Upload your job description PDF and we'll extract requirements automatically" },
              { step: "02", title: "Add Candidates", description: "Upload resumes to generate unique quiz links with verification questions" },
              { step: "03", title: "Review Results", description: "Compare candidates with detailed scores and anti-fraud indicators" },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="text-6xl font-bold text-primary/10 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="p-6 rounded-2xl bg-card shadow-soft-sm border border-border/50"
              >
                <benefit.icon className="h-8 w-8 text-accent mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
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
          <SignInButton />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="font-pacifico text-xl text-primary">Screenify</span>
          <Link
            href="/dev-preview"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to previews
          </Link>
        </div>
      </footer>
    </div>
  );
}
