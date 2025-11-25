'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Logo } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function RegisterPage() {
  const loginImage = PlaceHolderImages.find((p) => p.id === 'login-hero');
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [userType, setUserType] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fullName = event.currentTarget.fullName.value;
    const email = event.currentTarget.email.value;
    const password = event.currentTarget.password.value;
    const studentNumber = (event.currentTarget.elements.namedItem('studentNumber') as HTMLInputElement)?.value;

    if (!userType) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: 'Please select a user type.',
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Create user profile in Firestore
      const userProfileRef = doc(firestore, 'users', user.uid, 'profile', user.uid);
      const userProfileData: any = {
        id: user.uid,
        contactName: fullName,
        userType: userType,
        contactPhoneNumber: '',
        emergencyContactName: '',
        emergencyContactPhoneNumber: '',
        medicalInformation: '',
      };

      if (userType === 'student' && studentNumber) {
        userProfileData.studentNumber = studentNumber;
      }
      
      setDocumentNonBlocking(userProfileRef, userProfileData, { merge: true });

      toast({
        title: 'Account Created',
        description: 'You have been successfully registered. Please log in.',
      });
      router.push('/');
    } catch (error: any) {
      let errorMessage = 'An unknown error occurred.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please log in.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage =
          'The password is too weak. Please choose a stronger password.';
      }
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: errorMessage,
      });
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-[100vh] lg:grid-cols-2 xl:min-h-[100vh]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex justify-center items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-brand font-bold">SERS</h1>
            </div>
            <p className="text-balance text-muted-foreground">
              Create your Student Emergency Response account
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sign Up</CardTitle>
              <CardDescription>
                Enter your information to create an account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" placeholder="Jane Doe" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="userType">User Type</Label>
                    <Select onValueChange={setUserType} value={userType}>
                      <SelectTrigger id="userType">
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {userType === 'student' && (
                    <div className="grid gap-2">
                      <Label htmlFor="studentNumber">Student Number</Label>
                      <Input id="studentNumber" name="studentNumber" placeholder="S12345" required />
                    </div>
                  )}
                  <Button type="submit" className="w-full">
                    Create an account
                  </Button>
                  <div className="mt-4 text-center text-sm">
                    Already have an account?{' '}
                    <Link href="/" className="underline">
                      Login
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        {loginImage && (
          <Image
            src={loginImage.imageUrl}
            alt={loginImage.description}
            fill
            className="object-cover"
            data-ai-hint={loginImage.imageHint}
          />
        )}
      </div>
    </div>
  );
}
