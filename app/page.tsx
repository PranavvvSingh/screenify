import { SignInButtons } from "@/components/auth/sign-in-buttons";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 overflow-x-hidden">
      <div className="max-w-4xl w-full space-y-12 text-center px-2">
        {/* Hero Section */}
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {/* Project Name */}
          <div className="space-y-4">
            <h1 className="font-pacifico text-6xl sm:text-7xl md:text-8xl bg-clip-text text-transparent bg-linear-to-r from-primary via-primary/90 to-primary/70 tracking-tight wrap-break-word leading-tight py-8">
              Screenify
            </h1>
            <div className="h-1 w-32 bg-linear-to-r from-transparent via-primary to-transparent mx-auto"></div>
          </div>

          {/* Catchphrase */}
          <div className="space-y-3 mx-auto">
            <p className="text-xl md:text-2xl font-medium text-foreground/90">
              Transform Your Hiring Process with AI
            </p>
            <p className="text-lg md:text-xl text-muted-foreground tracking-wider">
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
