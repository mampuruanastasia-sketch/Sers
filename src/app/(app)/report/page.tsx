'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Flame, HeartPulse, ShieldAlert, Frown, Siren, MapPin } from 'lucide-react';
import { collection, doc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/PageHeader';
import type { IncidentType } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { useFirestore, useUser, useMemoFirebase, useDoc } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface UserProfile {
  contactName?: string;
  studentNumber?: string;
}

const incidentTypes: { name: IncidentType, icon: React.ElementType, color: string }[] = [
  { name: 'Fire', icon: Flame, color: 'text-red-500' },
  { name: 'Medical', icon: HeartPulse, color: 'text-blue-500' },
  { name: 'GBV', icon: ShieldAlert, color: 'text-purple-500' },
  { name: 'Bullying', icon: Frown, color: 'text-yellow-500' },
  { name: 'Crime', icon: Siren, color: 'text-orange-500' },
];

const reportFormSchema = z.object({
  incidentType: z.enum(['Fire', 'Medical', 'GBV', 'Bullying', 'Crime'], {
    required_error: 'You need to select an incident type.',
  }),
  locationDetails: z.string().min(5, { message: 'Location must be at least 5 characters.' }),
  detailedDescription: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

export default function ReportIncidentPage() {
  const { toast } = useToast();
  const [isLocating, setIsLocating] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  
  const incidentReportsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'incidentReports');
  }, [firestore]);

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'profile', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      locationDetails: '',
      detailedDescription: '',
    },
  });

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // In a real app, you would use a geocoding service to convert coords to an address.
          const locationString = `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`;
          form.setValue('locationDetails', locationString, { shouldValidate: true });
          setIsLocating(false);
          toast({ title: "Location detected successfully." });
        },
        () => {
          setIsLocating(false);
          toast({
            title: "Error fetching location.",
            description: "Please enable location services or enter your location manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
    }
  };

  function onSubmit(data: ReportFormValues) {
    if (!incidentReportsRef || !user || !userProfile) {
        toast({
            title: 'Error',
            description: 'You must be logged in and have a complete profile to submit a report.',
            variant: 'destructive',
        });
        return;
    }

    const reportId = uuidv4();
    const newReport = {
      ...data,
      id: reportId,
      userId: user.uid,
      userName: userProfile.contactName || 'Unknown User',
      studentNumber: userProfile.studentNumber || '',
      reportDateTime: new Date().toISOString(),
      mediaUrls: [],
      status: 'New',
    };
    
    const newDocRef = doc(incidentReportsRef, reportId);

    addDocumentNonBlocking(newDocRef, newReport);
    
    toast({
      title: "Incident Reported Successfully",
      description: "Campus staff have been notified and will respond shortly.",
    });
    form.reset();
  }

  return (
    <>
      <PageHeader
        title="Report an Incident"
        description="Your safety is our priority. Please provide as much detail as possible."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Select Incident Type</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="incidentType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                      >
                        {incidentTypes.map((type) => (
                           <FormItem key={type.name} className="flex items-center space-x-2">
                             <FormControl>
                               <RadioGroupItem
                                 value={type.name}
                                 id={type.name}
                                 className="sr-only"
                               />
                             </FormControl>
                             <Label
                               htmlFor={type.name}
                               className={`flex w-full flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors
                                 ${field.value === type.name ? 'border-primary' : ''}`}
                             >
                               <type.icon className={`h-8 w-8 mb-2 ${type.color}`} />
                               <span>{type.name}</span>
                             </Label>
                           </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>2. Provide Details</CardTitle>
              <CardDescription>All information is confidential and will only be used for the response.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="locationDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location of Incident</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="e.g., Near main library entrance" {...field} />
                      </FormControl>
                      <Button type="button" variant="outline" onClick={handleGetLocation} disabled={isLocating}>
                        <MapPin className={`mr-2 h-4 w-4 ${isLocating ? 'animate-pulse' : ''}`} />
                        {isLocating ? 'Locating...' : 'Use Current Location'}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="detailedDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what happened, who is involved, and any immediate dangers."
                        className="resize-y min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={!user || !userProfile}>Submit Report</Button>
          </div>
        </form>
      </Form>
    </>
  );
}
