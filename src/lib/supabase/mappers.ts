import { Database } from '@/types/database.types';
import { MasterProfile } from '@/types/master.types';
import { Reservation } from '@/types/reservation.types';
import { ChatRoom, Message } from '@/types/chat.types';
import { Membership } from '@/types/membership.types';
import { JoinCode } from '@/types/join-code.types';
import { Notification } from '@/types/notification.types';

type UserRow = Database['public']['Tables']['users']['Row'];
type MasterRow = Database['public']['Tables']['masters']['Row'];
type ReservationRow = Database['public']['Tables']['reservations']['Row'];
type ChatRoomRow = Database['public']['Tables']['chat_rooms']['Row'];
type MessageRow = Database['public']['Tables']['messages']['Row'];
type MembershipRow = Database['public']['Tables']['master_memberships']['Row'];
type JoinCodeRow = Database['public']['Tables']['join_codes']['Row'];
type NotificationRow = Database['public']['Tables']['notifications']['Row'];

// User row → User (without password)
export function mapProfileToUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    role: row.role,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  };
}

// Master row → MasterProfile
export function mapMasterRow(row: MasterRow): MasterProfile {
  return {
    id: row.id,
    userId: row.user_id,
    businessName: row.business_name,
    description: row.description,
    specialties: row.specialties as MasterProfile['specialties'],
    yearsExperience: row.years_experience,
    region: row.region,
    address: row.address,
    basePrice: row.base_price,
    status: row.status,
    images: row.images,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Reservation row → Reservation
export function mapReservationRow(row: ReservationRow): Reservation {
  return {
    id: row.id,
    masterId: row.master_id,
    userId: row.user_id,
    date: row.date,
    timeSlot: row.time_slot as Reservation['timeSlot'],
    duration: row.duration ?? 1,
    partySize: row.party_size ?? 1,
    consultationType: row.consultation_type,
    notes: row.notes,
    totalPrice: row.total_price,
    status: row.status,
    rejectionReason: row.rejection_reason ?? undefined,
    source: row.source as Reservation['source'],
    manualCustomerName: row.manual_customer_name ?? undefined,
    manualCustomerPhone: row.manual_customer_phone ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ChatRoom row → ChatRoom
export function mapChatRoomRow(row: ChatRoomRow & { participants?: string[] }): ChatRoom {
  return {
    id: row.id,
    userId: row.user_id,
    masterId: row.master_id,
    participants: row.participants ?? [],
    lastMessage: row.last_message,
    lastMessageAt: row.last_message_at,
    createdAt: row.created_at,
  };
}

// Message row → Message
export function mapMessageRow(row: MessageRow): Message {
  return {
    id: row.id,
    roomId: row.room_id,
    senderId: row.sender_id,
    content: row.content,
    type: row.type,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

// Membership row → Membership
export function mapMembershipRow(row: MembershipRow): Membership {
  return {
    id: row.id,
    masterId: row.master_id,
    userId: row.user_id,
    joinedVia: row.joined_via as Membership['joinedVia'],
    joinCodeId: row.join_code_id,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

// JoinCode row → JoinCode
export function mapJoinCodeRow(row: JoinCodeRow): JoinCode {
  return {
    id: row.id,
    masterId: row.master_id,
    code: row.code,
    label: row.label,
    maxUses: row.max_uses,
    currentUses: row.current_uses,
    status: row.status,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

// Notification row → Notification
export function mapNotificationRow(row: NotificationRow): Notification {
  return {
    id: row.id,
    recipientId: row.recipient_id,
    masterId: row.master_id,
    reservationId: row.reservation_id,
    type: row.type,
    title: row.title,
    body: row.body,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}
