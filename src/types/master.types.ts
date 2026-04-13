export type MasterStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type Specialty = string;

export interface MasterProfile {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  specialties: Specialty[];
  yearsExperience: number;
  region: string;
  address: string;
  basePrice: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  status: MasterStatus;
  images: string[];
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MasterWithUser extends MasterProfile {
  user: {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
  };
}
