import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { permission } from 'process';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request:Request)=>{
          let token:any = null;
          if(request && request.cookies){
             token = request.cookies['access_token'];
          }
          if(!token && request.headers.authorization){
            token = request.headers.authorization.replace('Bearer ', '')
          }
          return token
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!, 
    });
  }

  async validate(payload: any) {
    return { _id: payload.sub, username: payload.username ,permissions: payload.permissions};
  }
}