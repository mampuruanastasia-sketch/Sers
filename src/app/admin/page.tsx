'use client';

import { MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { collection, doc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/PageHeader';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

// Define the shape of an incident report from Firestore
interface IncidentReport {
  id: string;
  incidentType: string;
  status: 'New' | 'Acknowledged' | 'Resolved';
  userId: string;
  userName: string;
  studentNumber?: string;
  reportDateTime: string;
}

export default function AdminDashboardPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();


  // Memoize the query to prevent re-renders
  const incidentReportsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'incidentReports');
  }, [firestore]);

  // Fetch the collection data
  const { data: incidents, isLoading } = useCollection<IncidentReport>(incidentReportsQuery);
  
  const handleUpdateStatus = (incidentId: string, status: 'Acknowledged' | 'Resolved') => {
    if (!firestore) return;
    const incidentRef = doc(firestore, 'incidentReports', incidentId);
    updateDocumentNonBlocking(incidentRef, { status });
    toast({
      title: 'Status Updated',
      description: `Incident #${incidentId.substring(0,6)} has been marked as ${status}.`,
    });
  };

  return (
    <>
      <PageHeader title="Incidents" description="Manage and respond to all reported incidents on campus." />
      
      <Card>
        <CardHeader>
          <CardTitle>Incident Reports</CardTitle>
          <CardDescription>
            A list of all incidents reported by students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Name</TableHead>
                <TableHead className="hidden lg:table-cell">Student Number</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead>
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading incidents...</TableCell>
                </TableRow>
              )}
              {!isLoading && incidents?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No incidents reported yet.</TableCell>
                </TableRow>
              )}
              {incidents?.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">{incident.incidentType}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={incident.status === 'New' ? 'destructive' : incident.status === 'Acknowledged' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {incident.status?.toLowerCase() || 'new'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {incident.userName}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {incident.studentNumber}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(incident.reportDateTime), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => router.push(`/admin/reports/${incident.id}`)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => handleUpdateStatus(incident.id, 'Acknowledged')}
                          disabled={incident.status === 'Acknowledged' || incident.status === 'Resolved'}
                        >
                          Acknowledge
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => handleUpdateStatus(incident.id, 'Resolved')}
                          disabled={incident.status === 'Resolved'}
                        >
                          Resolve
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
