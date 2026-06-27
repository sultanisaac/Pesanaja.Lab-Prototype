import Link from "next/link";
import { signup } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RegisterPage() {
  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="font-heading text-3xl font-bold">Create an account</CardTitle>
        <CardDescription className="text-base text-secondary-foreground">
          Join Pesanaja.Lab to find services or grow your business.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Tabs defaultValue="customer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="business">Business Owner</TabsTrigger>
          </TabsList>
          
          <TabsContent value="customer">
            <form action={signup} className="space-y-6">
              <input type="hidden" name="role" value="customer" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    required
                    className="h-12 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    className="h-12 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="h-12 bg-white"
                  />
                </div>
              </div>
              
              <Button type="submit" className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary-hover">
                Create Customer Account
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="business">
            <form action={signup} className="space-y-6">
              <input type="hidden" name="role" value="business" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business-fullName">Full Name</Label>
                  <Input
                    id="business-fullName"
                    name="fullName"
                    placeholder="Jane Smith"
                    required
                    className="h-12 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-email">Business Email</Label>
                  <Input
                    id="business-email"
                    name="email"
                    type="email"
                    placeholder="contact@business.com"
                    required
                    className="h-12 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-password">Password</Label>
                  <Input
                    id="business-password"
                    name="password"
                    type="password"
                    required
                    className="h-12 bg-white"
                  />
                </div>
              </div>
              
              <Button type="submit" className="h-12 w-full bg-brand text-primary font-semibold hover:bg-brand/80">
                Create Business Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
