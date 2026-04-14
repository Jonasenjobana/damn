import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { randomBytes } from 'crypto';
import * as geoip from 'geoip-lite';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visitor } from './entities/visitor.entity';

const FINGERPRINT_COOKIE_NAME = 'visitor_fingerprint';
const FINGERPRINT_EXPIRES_HOURS = 1;

function generateFingerprint(): string {
  return randomBytes(16).toString('hex');
}

declare module 'express' {
  interface Request {
    visitorFingerprint?: string;
  }
}

@Injectable()
export class VisitorFingerprintInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(Visitor)
    private visitorRepo: Repository<Visitor>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    let fingerprint = request.cookies[FINGERPRINT_COOKIE_NAME];

    if (!fingerprint) {
      fingerprint = generateFingerprint();
      response.cookie(FINGERPRINT_COOKIE_NAME, fingerprint, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: FINGERPRINT_EXPIRES_HOURS * 60 * 60 * 1000,
        path: '/',
      });
    }

    request.visitorFingerprint = fingerprint;

    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    const userAgent = request.headers['user-agent'] || 'unknown';

    setTimeout(async () => {
      await this.recordVisitor(ip, fingerprint, userAgent);
    }, 0);

    return next.handle();
  }

  private async recordVisitor(
    ip: string,
    fingerprint: string,
    userAgent: string,
  ) {
    try {
      let geo: any = null;

      if (
        ip &&
        ip !== '127.0.0.1' &&
        ip !== '::1' &&
        !ip.startsWith('192.168.') &&
        !ip.startsWith('10.')
      ) {
        geo = geoip.lookup(ip);
      }

      const visitor = this.visitorRepo.create({
        ipAddress: ip,
        country: geo?.country || 'Unknown',
        city: geo?.city || 'Unknown',
        latitude: geo?.ll?.[0] || null,
        longitude: geo?.ll?.[1] || null,
        userAgent: userAgent,
        visitTime: new Date(),
      });

      await this.visitorRepo.save(visitor);
    } catch (error) {
      console.error('Failed to record visitor:', error);
    }
  }
}
