import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            phone: string | null;
            isPhoneVerified: boolean;
            role: string;
            isWorker: boolean;
            isWebsite: boolean;
            profileImage: string | null;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        phone: string | null;
        isPhoneVerified: boolean;
        role: string;
        isWorker: boolean;
        isWebsite: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id: string;
        phone: string | null;
        isPhoneVerified: boolean;
        role: string;
        isWorker: boolean;
        isWebsite: boolean;
        profileImage?: string | null;
    }
}
