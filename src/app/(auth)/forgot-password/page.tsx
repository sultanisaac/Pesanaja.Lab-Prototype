import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPassword } from "../actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;
  const success = params?.success;

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="font-heading text-3xl font-bold">Reset Password</CardTitle>
        <CardDescription className="text-base text-secondary-foreground">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="space-y-6">
          <form action={resetPassword} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-200">
                Check your email for a password reset link.
              </div>
            )}

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
            
            <Button type="submit" className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary-hover">
              Send Reset Link
            </Button>

            <div className="text-center text-sm">
              Remember your password?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Back to sign in
              </Link>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
