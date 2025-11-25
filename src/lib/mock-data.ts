import type { Incident } from './types';

export const mockIncidents: Incident[] = [
  {
    id: 'INC001',
    type: 'Medical',
    description: 'Student fainted in the library, requires medical attention.',
    location: 'Main Library, 2nd Floor',
    reportedAt: new Date('2024-07-20T10:30:00Z'),
    status: 'New',
    student: {
      name: 'Alice Johnson',
      id: 'S12345',
    },
  },
  {
    id: 'INC002',
    type: 'Fire',
    description: 'Small fire detected in the chemistry lab C-102. Smoke visible.',
    location: 'Science Building, Lab C-102',
    reportedAt: new Date('2024-07-20T09:15:00Z'),
    status: 'Acknowledged',
    student: {
      name: 'Bob Williams',
      id: 'S67890',
    },
  },
  {
    id: 'INC003',
    type: 'Crime',
    description: 'Laptop theft reported from the student cafeteria.',
    location: 'Student Cafeteria',
    reportedAt: new Date('2024-07-19T15:00:00Z'),
    status: 'Resolved',
    student: {
      name: 'Charlie Brown',
      id: 'S11223',
    },
  },
    {
    id: 'INC004',
    type: 'Bullying',
    description: 'Verbal harassment reported near the sports complex.',
    location: 'Behind Sports Complex',
    reportedAt: new Date('2024-07-19T11:45:00Z'),
    status: 'Acknowledged',
    student: {
      name: 'Diana Prince',
      id: 'S44556',
    },
  },
  {
    id: 'INC005',
    type: 'GBV',
    description: 'A student has reported an incident of gender-based violence and is requesting immediate support.',
    location: 'Dormitory B, Room 301',
    reportedAt: new Date('2024-07-20T11:00:00Z'),
    status: 'New',
    student: {
      name: 'Eve Adams',
      id: 'S77889',
    },
  },
];
