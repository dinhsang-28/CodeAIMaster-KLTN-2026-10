import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  path: '/api/v1/socket.io',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class NotificationGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  private getTokenFromCookie(cookieHeader?: string): string | null {
    if (!cookieHeader) return null;
    const tokenPair = cookieHeader
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('access_token='));
    if (!tokenPair) return null;
    return decodeURIComponent(tokenPair.split('=').slice(1).join('='));
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        this.getTokenFromCookie(client.handshake.headers.cookie);

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.userId || payload.id;

      client.data.userId = userId;

      client.join(`user:${userId}`);

      console.log(`User ${userId} connected notification socket`);
    } catch (error) {
      client.disconnect();
    }
  }

  sendToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }

  updateUnreadCount(userId: string, count: number) {
    this.server.to(`user:${userId}`).emit('notification:count_updated', {
      count,
    });
  }
}
