import { SignInButtons } from "@/components/auth/sign-in-buttons";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-12 text-center">
        {/* Hero Section */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {/* Project Name */}
          <div className="space-y-4">
            <h1 className="text-7xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/70 tracking-tight">
              Screenify
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
          </div>

          {/* Catchphrase */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <p className="text-2xl md:text-3xl font-medium text-foreground/90">
              Transform Your Hiring Process with AI
            </p>
            <p className="text-lg md:text-xl text-muted-foreground">
              Streamline candidate screening with intelligent, automated technical assessments
              that save time and identify top talent faster
            </p>
          </div>
        </div>

        {/* Login Section */}
        <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <SignInButtons />
        </div>

        {/* Optional: Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          <div className="space-y-2">
            <div className="text-3xl">🤖</div>
            <h3 className="font-semibold text-foreground">AI-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Intelligent screening tailored to each role
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">⚡</div>
            <h3 className="font-semibold text-foreground">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">
              Screen candidates in minutes, not days
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl">🎯</div>
            <h3 className="font-semibold text-foreground">Precision Hiring</h3>
            <p className="text-sm text-muted-foreground">
              Find the perfect fit for your team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
