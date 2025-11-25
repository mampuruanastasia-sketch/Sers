export type IncidentType = 'Fire' | 'Medical' | 'GBV' | 'Bullying' | 'Crime';

export type Incident = {
  id: string;
  type: IncidentType;
  description: string;
  location: string;
  reportedAt: Date;
  status: 'New' | 'Acknowledged' | 'Resolved';
  student: {
    name: string;
    id: string;
  };
};
