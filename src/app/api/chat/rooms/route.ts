import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import {
  getRoomsByUserId,
  findExistingRoom,
  createRoom,
  getUnreadCountByRoom,
} from '@/lib/data/chat-data';
import { findMasterById } from '@/lib/data/masters-data';
import { findUserById } from '@/lib/auth/users-data';
import { CreateRoomData } from '@/types/chat.types';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  const user = await verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  const rooms = await getRoomsByUserId(user.userId);

  const roomsWithParticipant = await Promise.all(
    rooms.map(async (room) => {
      const isUser = room.userId === user.userId;

      if (isUser) {
        const master = await findMasterById(room.masterId);
        const masterUserRow = master
          ? await findUserById(master.userId)
          : null;
        return {
          ...room,
          otherUser: {
            id: masterUserRow?.id || '',
            fullName: masterUserRow?.full_name || '알 수 없음',
            avatarUrl: masterUserRow?.avatar_url || null,
            businessName: master?.businessName,
            images: master?.images,
          },
          unreadCount: await getUnreadCountByRoom(room.id, user.userId),
        };
      } else {
        const userRow = await findUserById(room.userId);
        return {
          ...room,
          otherUser: {
            id: userRow?.id || '',
            fullName: userRow?.full_name || '알 수 없음',
            avatarUrl: userRow?.avatar_url || null,
          },
          unreadCount: await getUnreadCountByRoom(room.id, user.userId),
        };
      }
    })
  );

  return NextResponse.json({ rooms: roomsWithParticipant });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  const user = await verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  const body: CreateRoomData = await request.json();
  const master = await findMasterById(body.masterId);

  if (!master) {
    return NextResponse.json({ error: '무속인을 찾을 수 없습니다' }, { status: 404 });
  }

  // 사용자가 요청하는 경우
  if (user.role === 'user') {
    const existing = await findExistingRoom(user.userId, body.masterId);
    if (existing) {
      return NextResponse.json({ room: existing });
    }
    const room = await createRoom(user.userId, body.masterId, master.userId);
    return NextResponse.json({ room }, { status: 201 });
  }

  return NextResponse.json({ error: '사용자만 채팅방을 생성할 수 있습니다' }, { status: 403 });
}
