export class ApiResponse<T = any> {
  rlt: string;
  msg: string;
  data: T | null;

  private constructor(rlt: string, msg: string, data: T | null) {
    this.rlt = rlt;
    this.msg = msg;
    this.data = data;
  }

  static success<T>(data: T, msg: string = 'success'): ApiResponse<T> {
    return new ApiResponse('0', msg, data);
  }

  static error(msg: string, data: any = null): ApiResponse<any> {
    return new ApiResponse('1', msg, data);
  }
}
