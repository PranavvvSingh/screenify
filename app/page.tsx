import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Screenify</h1>
          <p className="text-muted-foreground">AI-Powered Candidate Screening Platform</p>
        </div>

        {/* Demo Components */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card Example 1 */}
          <Card>
            <CardHeader>
              <CardTitle>Theme Preview</CardTitle>
              <CardDescription>Testing the indigo dark theme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
              <div className="flex gap-2">
                <Button>Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
              </div>
            </CardContent>
          </Card>

          {/* Card Example 2 */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Please fill in your details below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <Button className="w-full">Submit</Button>
            </CardContent>
          </Card>
        </div>

        {/* Color Palette Display */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>Indigo theme colors in action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-primary"></div>
                <p className="text-sm text-muted-foreground">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-secondary"></div>
                <p className="text-sm text-muted-foreground">Secondary</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-accent"></div>
                <p className="text-sm text-muted-foreground">Accent</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-muted"></div>
                <p className="text-sm text-muted-foreground">Muted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
