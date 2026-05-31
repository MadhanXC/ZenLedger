"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Files, 
  Mail, 
  Lock, 
  Key,
  Loader2, 
  UserPlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth, useFirestore } from "@/firebase"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const auth = useAuth()
  const db = useFirestore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    inviteCode: ""
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate unique registration code from env
    const REGISTRATION_CODE = process.env.NEXT_PUBLIC_REGISTRATION_CODE
    if (formData.inviteCode !== REGISTRATION_CODE) {
      toast({
        title: "Invalid Access Code",
        description: "The registration code you entered is incorrect. Please contact your administrator.",
        variant: "destructive"
      })
      return
    }

    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      // Update display name
      await updateProfile(user, { displayName: formData.name })

      // Create initial user document
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        name: formData.name,
        email: formData.email,
        createdAt: new Date().toISOString()
      })

      toast({
        title: "Account Created",
        description: "Welcome to Zen Ledger!",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Could not create account.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-accent">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-accent/10">
              <Files className="size-10 text-accent" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Join Zen Ledger today. Invitation code required.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  className="pl-10"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-code">Registration Access Code</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-accent" />
                <Input 
                  id="invite-code" 
                  type="text" 
                  placeholder="Enter unique access code" 
                  className="pl-10 border-accent/30 focus:border-accent"
                  value={formData.inviteCode}
                  onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value })}
                  required
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Unique code is required to prevent unauthorized access.</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
              {isLoading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <><UserPlus className="size-4 mr-2" /> Register</>}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-accent font-semibold hover:underline">
                Login here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
