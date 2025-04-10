import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {

    register() {
        return { "message": 'User registered successfully!' };
    }

    login() {
        return { "message": 'User logged in successfully!' };
    }
}
