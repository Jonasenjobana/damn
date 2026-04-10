import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as geoip from 'geoip-lite';
import { Visitor } from './entities/visitor.entity';

@Injectable()
export class VisitorService {
  constructor(
    @InjectRepository(Visitor)
    private visitorRepo: Repository<Visitor>,
  ) {}

  async recordVisit(ip: string, userAgent: string): Promise<Visitor> {
    try {
      let geo: any = null;
      
      if (ip && ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
        geo = geoip.lookup(ip);
      }
      
      const visitor = this.visitorRepo.create({
        ipAddress: ip || 'unknown',
        country: geo?.country || 'Unknown',
        city: geo?.city || 'Unknown',
        latitude: geo?.ll?.[0] || null,
        longitude: geo?.ll?.[1] || null,
        userAgent: userAgent || 'unknown',
        visitTime: new Date(),
      });
      
      return await this.visitorRepo.save(visitor);
    } catch (error) {
      console.error('Failed to record visitor:', error);
      throw error;
    }
  }

  async getVisitorStats() {
    try {
      const visitors = await this.visitorRepo.find({
        order: { visitTime: 'DESC' },
        take: 1000,
      });

      const countryStats = this.groupByCountry(visitors);
      const cityStats = this.groupByCity(visitors);

      const locations = visitors
        .filter(v => v.latitude && v.longitude)
        .map(v => ({
          lat: v.latitude,
          lng: v.longitude,
          city: v.city,
          country: v.country,
          time: v.visitTime,
        }));

      return {
        totalVisitors: visitors.length,
        countryStats,
        cityStats,
        locations,
      };
    } catch (error) {
      console.error('Failed to get visitor stats:', error);
      throw error;
    }
  }

  private groupByCountry(visitors: Visitor[]): Array<{ country: string; count: number }> {
    const stats = new Map<string, number>();
    
    visitors.forEach(v => {
      const country = v.country || 'Unknown';
      stats.set(country, (stats.get(country) || 0) + 1);
    });
    
    return Array.from(stats.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);
  }

  private groupByCity(visitors: Visitor[]): Array<{ city: string; count: number }> {
    const stats = new Map<string, number>();
    
    visitors.forEach(v => {
      const city = v.city || 'Unknown';
      const key = `${city} (${v.country || 'Unknown'})`;
      stats.set(key, (stats.get(key) || 0) + 1);
    });
    
    return Array.from(stats.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);
  }
}
