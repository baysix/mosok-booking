import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import {
  findRoomById,
  getMessagesByRoomId,
  addMessage,
  markMessagesAsRead,
} from '@/lib/data/chat-data';
import { SendMessageData } from '@/types/chat.types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  const user = await verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  const room = await findRoomById(roomId);
  if (!room) {
    return NextResponse.json({ error: '채팅방을 찾을 수 없습니다' }, { status: 404 });
  }

  if (!room.participants.includes(user.userId)) {
    return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 });
  }

  await markMessagesAsRead(roomId, user.userId);

  const messages = await getMessagesByRoomId(roomId);
  return NextResponse.json({ messages });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  const user = await verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
  }

  const room = await findRoomById(roomId);
  if (!room) {
    return NextResponse.json({ error: '채팅방을 찾을 수 없습니다' }, { status: 404 });
  }

  if (!room.participants.includes(user.userId)) {
    return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 });
  }

  const body: SendMessageData = await request.json();

  if (!body.content || body.content.trim().length === 0) {
    return NextResponse.json({ error: '메시지 내용을 입력해주세요' }, { status: 400 });
  }

  const message = await addMessage(roomId, user.userId, body.content.trim());
  return NextResponse.json({ message }, { status: 201 });
}
