import { TokenPayload } from '../shared/middleware/authControl';

declare global {
    namespace Express {
        interface Request {
            auth?: TokenPayload;
        }
    }
}

export { }
