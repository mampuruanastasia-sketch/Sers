
'use client';

import { useParams } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { Calendar, FileText, MapPin, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface IncidentReport {
  id: string;
  incidentType: string;
  locationDetails: string;
  detailedDescription: string;
  reportDateTime: string;
  status: 'New' | 'Acknowledged' | 'Resolved';
  userName: string;
}

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params.reportId as string;
  const firestore = useFirestore();

  const reportRef = useMemoFirebase(() => {
    if (!firestore || !reportId) return null;
    return doc(firestore, 'incidentReports', reportId);
  }, [firestore, reportId]);

  const { data: report, isLoading } = useDoc<IncidentReport>(reportRef);

  const getStatusVariant = (status: IncidentReport['status']) => {
    switch (status) {
      case 'New':
        return 'destructive';
      case 'Acknowledged':
        return 'default';
      case 'Resolved':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <PageHeader
        title={isLoading ? 'Loading Report...' : `Report: ${report?.incidentType || 'Details'}`}
        description={`Details for incident report #${reportId}`}
      />
      <Card>
        <CardHeader>
            {isLoading ? (
                 <Skeleton className="h-8 w-3/4" />
            ) : (
                <CardTitle className="flex items-center justify-between">
                    <span>{report?.incidentType} Incident</span>
                    <Badge variant={getStatusVariant(report?.status || 'New')} className="capitalize">
                        {report?.status.toLowerCase() || '...'}
                    </Badge>
                </CardTitle>
            )}
           <CardDescription>
            {isLoading ? <Skeleton className="h-4 w-1/2 mt-1" /> : `Report ID: ${reportId}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
            {isLoading ? (
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <User className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="space-y-1">
                            <Skeleton className="h-5 w-[150px]" />
                            <Skeleton className="h-4 w-[100px]" />
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="space-y-1">
                            <Skeleton className="h-5 w-[200px]" />
                            <Skeleton className="h-4 w-[150px]" />
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                         <div className="space-y-1">
                            <Skeleton className="h-5 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                         <div className="space-y-1">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-4/5" />
                        </div>
                    </div>
                </div>
            ) : report ? (
                <>
                    <div className="grid gap-2">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground"/>
                            <h3 className="text-lg font-semibold">Reported By</h3>
                        </div>
                        <p className="ml-8 text-muted-foreground">
                            {report.userName}
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground"/>
                            <h3 className="text-lg font-semibold">Date & Time</h3>
                        </div>
                        <p className="ml-8 text-muted-foreground">
                            {format(new Date(report.reportDateTime), "PPPp")}
                        </p>
                    </div>
                     <div className="grid gap-2">
                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground"/>
                            <h3 className="text-lg font-semibold">Location</h3>
                        </div>
                        <p className="ml-8 text-muted-foreground">
                            {report.locationDetails}
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground"/>
                            <h3 className="text-lg font-semibold">Description</h3>
                        </div>
                        <p className="ml-8 text-muted-foreground whitespace-pre-wrap">
                            {report.detailedDescription}
                        </p>
                    </div>
                </>
            ) : (
                <p>No report found.</p>
            )}
        </CardContent>
      </Card>
    </>
  );
}
