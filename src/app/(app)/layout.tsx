'use client';
import { AppLayout } from '@/components/AppLayout';
import { SidebarProvider } from '@/components/ui/sidebar';
import { FirebaseClientProvider } from '@/firebase';

export default function AuthenticatedLayout({
  children,
  
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <SidebarProvider>
        <AppLayout>{children}</AppLayout>
      </SidebarProvider>
    </FirebaseClientProvider>
  );
}
