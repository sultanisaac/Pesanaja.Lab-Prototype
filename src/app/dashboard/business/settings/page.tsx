import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowLeft, Upload } from "lucide-react"
import Link from 'next/link'

export default async function BusinessSettings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/business" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}><ArrowLeft className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-3xl font-heading font-bold">Business Profile</h1>
          <p className="text-secondary-foreground">Manage your business details and verification documents.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Update your business name, description, and contact info.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" defaultValue={user?.user_metadata?.full_name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea 
                  id="description" 
                  className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Tell customers about your services..."
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Public Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="123 Main St, Jakarta" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Verification</CardTitle>
              <CardDescription>Upload your business licenses and ID to get the Verified Badge.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-dashed p-8 text-center bg-muted/20 hover:bg-muted/50 transition-colors">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-1">Upload Documents</h3>
                <p className="text-sm text-muted-foreground mb-4">Drag and drop or click to select files (PDF, JPG, PNG)</p>
                <Button variant="outline">Select Files</Button>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-sm">Uploaded Documents</h4>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded">
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">KTP_Owner.jpg</p>
                      <p className="text-xs text-muted-foreground">1.2 MB</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-1 rounded">Pending Review</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Completeness</span>
                <span className="font-bold">65%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <ul className="text-sm space-y-2 mt-4 text-muted-foreground">
                <li className="flex items-center gap-2 text-success"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Basic Info</li>
                <li className="flex items-center gap-2 text-success"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Contact Details</li>
                <li className="flex items-center gap-2"><div className="w-4 h-4 border-2 rounded-full"></div> Upload Documents</li>
                <li className="flex items-center gap-2"><div className="w-4 h-4 border-2 rounded-full"></div> Add Services</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
