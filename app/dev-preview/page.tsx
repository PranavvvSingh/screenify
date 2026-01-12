import Link from "next/link";
import { ArrowRight, Palette, FileQuestion, Home } from "lucide-react";

export default function DevPreviewIndex() {
  const previews = [
    {
      title: "Landing Page",
      description: "Hero section, feature cards, sign-in flow",
      href: "/dev-preview/landing",
      icon: Home,
    },
    {
      title: "Quiz Interface",
      description: "Quiz landing, taking interface, progress tracking",
      href: "/dev-preview/quiz",
      icon: FileQuestion,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Palette className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Design Preview
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Preview the new Screenify design system before rolling out to production.
          </p>
        </div>

        {/* Design System Info */}
        <div className="mb-12 p-6 rounded-2xl bg-card shadow-soft-md">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Design System
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Typography</p>
              <p className="font-medium">Satoshi</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Primary</p>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded bg-primary"></div>
                <span className="font-mono text-sm">#C45C3B</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Accent</p>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded bg-accent"></div>
                <span className="font-mono text-sm">#D4A574</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Background</p>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded bg-background border border-border"></div>
                <span className="font-mono text-sm">#FAFAF8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Cards */}
        <div className="grid gap-4">
          {previews.map((preview) => (
            <Link
              key={preview.href}
              href={preview.href}
              className="group p-6 rounded-2xl bg-card shadow-soft-md hover-lift flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <preview.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {preview.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {preview.description}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>

        {/* Back to main */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to main site
          </Link>
        </div>
      </div>
    </div>
  );
}
