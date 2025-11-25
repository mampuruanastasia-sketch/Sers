'use client';

import { collection, query, where } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/PageHeader';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import Link from 'next/link';

interface IncidentReport {
  id: string;
  incidentType: string;
  locationDetails: string;
  reportDateTime: string;
  status: 'New' | 'Acknowledged' | 'Resolved';
}

export default function AllReportsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userIncidentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'incidentReports'),
      where('userId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: incidents, isLoading } = useCollection<IncidentReport>(userIncidentsQuery);

  return (
    <>
      <PageHeader title="My Reports" description="A complete history of all incidents you have reported." />
      
      <Card>
        <CardHeader>
          <CardTitle>All Incident Reports</CardTitle>
          <CardDescription>
            Here you can track the status of all your submitted reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="hidden md:table-cell">Reported</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading your reports...</TableCell>
                </TableRow>
              )}
              {!isLoading && incidents?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">You have not reported any incidents.</TableCell>
                </TableRow>
              )}
              {!isLoading && incidents?.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>
                    <div className="font-medium">{incident.incidentType}</div>
                  </TableCell>
                  <TableCell>{incident.locationDetails}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatDistanceToNow(new Date(incident.reportDateTime), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={incident.status === 'New' ? 'destructive' : incident.status === 'Acknowledged' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {incident.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                   <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/reports/${incident.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
