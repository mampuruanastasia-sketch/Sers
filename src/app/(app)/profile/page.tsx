'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { UserCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/PageHeader';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useSidebar } from '@/components/ui/sidebar';

const profileFormSchema = z.object({
  contactName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  contactPhoneNumber: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  emergencyContactName: z.string().min(2, { message: 'Contact name must be at least 2 characters.' }),
  emergencyContactPhoneNumber: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  medicalInformation: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface UserProfile {
  contactName?: string;
  contactPhoneNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhoneNumber?: string;
  medicalInformation?: string;
  studentNumber?: string;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setOpen } = useSidebar();
  const isSetup = searchParams.get('setup') === 'true';


  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'profile', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading } = useDoc<UserProfile>(userProfileRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      contactName: '',
      contactPhoneNumber: '',
      emergencyContactName: '',
      emergencyContactPhoneNumber: '',
      medicalInformation: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        contactName: userProfile.contactName || '',
        contactPhoneNumber: userProfile.contactPhoneNumber || '',
        emergencyContactName: userProfile.emergencyContactName || '',
        emergencyContactPhoneNumber: userProfile.emergencyContactPhoneNumber || '',
        medicalInformation: userProfile.medicalInformation || '',
      });
    }
  }, [userProfile, form]);


  function onSubmit(data: ProfileFormValues) {
    if (!userProfileRef || !user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update your profile.',
        variant: 'destructive',
      });
      return;
    }
    
    setDocumentNonBlocking(userProfileRef, {
      ...data,
      id: user.uid, // ensure id is set
    }, { merge: true });

    toast({
      title: 'Profile Updated',
      description: 'Your information has been saved successfully.',
    });

    setOpen(true);

    // If in setup mode, redirect to dashboard after saving.
    if(isSetup) {
      router.push('/dashboard');
    }
  }

  return (
    <>
      <PageHeader
        title="Your Profile"
        description="Keep your information up-to-date for faster emergency response."
      />
      {isSetup && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Complete Your Profile</AlertTitle>
          <AlertDescription>
            Welcome! Please complete your profile before proceeding to the dashboard. This ensures we have the necessary information in case of an emergency.
          </AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <UserCircle className="h-16 w-16 text-muted-foreground" />
                <div>
                  <CardTitle className="text-2xl">Personal Information</CardTitle>
                  <CardDescription>This information helps us identify you correctly.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPhoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>This person will be contacted in case of an emergency.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="emergencyContactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact's Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Emergency contact's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyContactPhoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact's Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Emergency contact's phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="medicalInformation"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Medical Information (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Allergies, conditions" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>Save Changes</Button>
          </div>
        </form>
      </Form>
    </>
  );
}
