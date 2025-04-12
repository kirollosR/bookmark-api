export class ErrorResponseDto {
    success: boolean;
    error: {
      code: string;
      message: string;
      details?: any;
    };
  
    constructor(code: string, message: string, details?: any) {
      this.success = false;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.error = { code, message, details };
    }
  }