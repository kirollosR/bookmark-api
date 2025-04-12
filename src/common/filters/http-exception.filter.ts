import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponseDto } from '../dto/error-response.dto';

interface ErrorResponse {
  code?: string;
  message?: string;
  details?: any;
  error?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as string | ErrorResponse;

    // If it's a string response
    if (typeof exceptionResponse === 'string') {
      response.status(status).json(new ErrorResponseDto(
        `HTTP_${status}`,
        exceptionResponse,
        undefined
      ));
      return;
    }

    // Now we know it's an object
    const errorResponse = exceptionResponse;

    // Check if the exception already contains our error format
    if (errorResponse.code && errorResponse.message) {
      // It's already in our desired error format
      response.status(status).json(new ErrorResponseDto(
        errorResponse.code,
        errorResponse.message,
        errorResponse.details
      ));
    } else {
      // It's a standard exception, transform it
      const message = errorResponse.message || 'An error occurred';
        
      response.status(status).json(new ErrorResponseDto(
        `HTTP_${status}`,
        message,
        errorResponse.error || undefined
      ));
    }
  }
}