export interface Membership {
  id: string;
  masterId: string;
  userId: string;
  joinedVia: 'invite_code' | 'phone' | 'admin';
  joinCodeId: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface MembershipWithUser extends Membership {
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
}

export interface MembershipWithMaster extends Membership {
  master: {
    id: string;
    businessName: string;
    specialties: string[];
    basePrice: number;
    images: string[];
  };
}
