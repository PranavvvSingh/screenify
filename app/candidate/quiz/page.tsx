import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function QuizPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Technical Assessment</h1>
          <p className="text-muted-foreground mt-1">Question 1 of 20</p>
        </div>
        <Card className="px-4 py-2">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">45:00</p>
            <p className="text-xs text-muted-foreground">Time Remaining</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge>React</Badge>
                <Badge variant="secondary">Medium</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  What is the purpose of the useEffect hook in React?
                </h3>
                <RadioGroup defaultValue="option-1">
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent">
                    <RadioGroupItem value="option-1" id="option-1" />
                    <Label htmlFor="option-1" className="flex-1 cursor-pointer">
                      To manage component state
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent">
                    <RadioGroupItem value="option-2" id="option-2" />
                    <Label htmlFor="option-2" className="flex-1 cursor-pointer">
                      To perform side effects in function components
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent">
                    <RadioGroupItem value="option-3" id="option-3" />
                    <Label htmlFor="option-3" className="flex-1 cursor-pointer">
                      To create custom hooks
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent">
                    <RadioGroupItem value="option-4" id="option-4" />
                    <Label htmlFor="option-4" className="flex-1 cursor-pointer">
                      To handle form submissions
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex justify-between">
                <Button variant="outline">Previous</Button>
                <div className="flex gap-3">
                  <Button variant="outline">Skip</Button>
                  <Button>Next Question</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Important Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Do not switch tabs or exit fullscreen mode during the assessment</p>
              <p>• Your progress is automatically saved</p>
              <p>• You can skip questions and return to them later</p>
              <p>• The assessment will auto-submit when time expires</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Answered</span>
                  <span className="font-semibold">0/20</span>
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <div className="h-full bg-primary rounded-full" style={{ width: "0%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Question Navigator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 20 }, (_, i) => (
                  <button
                    key={i}
                    className="aspect-square rounded border border-border hover:bg-accent text-sm font-semibold"
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-primary bg-primary"></div>
                  <span className="text-muted-foreground">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-500"></div>
                  <span className="text-muted-foreground">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-border"></div>
                  <span className="text-muted-foreground">Not Answered</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button variant="destructive" className="w-full">
            Submit Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}
