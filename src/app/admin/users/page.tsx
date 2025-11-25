'use client';

import { collectionGroup } from 'firebase/firestore';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/PageHeader';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';

interface UserProfile {
  id: string;
  contactName: string;
  userType: 'student' | 'admin';
  studentNumber?: string;
}

export default function AdminUsersPage() {
  const firestore = useFirestore();

  const userProfilesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collectionGroup(firestore, 'profile');
  }, [firestore]);

  const { data: users, isLoading } = useCollection<UserProfile>(userProfilesQuery);

  return (
    <>
      <PageHeader title="Users" description="Manage all registered users in the system." />
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all student and admin accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>User Type</TableHead>
                <TableHead>Student Number</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">Loading users...</TableCell>
                </TableRow>
              )}
              {!isLoading && users?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">No users found.</TableCell>
                </TableRow>
              )}
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.contactName}</TableCell>
                  <TableCell>
                    <Badge variant={user.userType === 'admin' ? 'destructive' : 'secondary'} className="capitalize">
                      {user.userType}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.studentNumber || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
