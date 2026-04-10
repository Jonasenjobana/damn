import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function convertKeysToCamelCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  }

  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = toCamelCase(key);
        newObj[camelKey] = convertKeysToCamelCase(obj[key]);
      }
    }
    return newObj;
  }

  return obj;
}

function transformData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (data && typeof data === 'object') {
    const plain = instanceToPlain(data);
    return convertKeysToCamelCase(plain);
  }

  return data;
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        if (response && response.rlt !== undefined && response.msg !== undefined) {
          return {
            rlt: response.rlt,
            msg: response.msg,
            data: transformData(response.data),
          };
        }
        return response;
      }),
    );
  }
}
