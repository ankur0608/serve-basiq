// lib/messageCentral.ts
const BASE_URL = "https://cpaas.messagecentral.com";

interface MCAuthResponse {
    token: string;
    status: number;
    message?: string; // Added for error logging
    error?: string;   // Added for error logging
}

interface MCSendResponse {
    responseCode: number;
    message: string;
    data: {
        verificationId: string;
        mobileNumber: string;
    };
}

interface MCVerifyResponse {
    responseCode: number;
    message: string;
    data: {
        verificationStatus: string; // "VERIFICATION_COMPLETED"
    };
}

export const messageCentral = {
   
    getAuthToken: async (): Promise<string> => {
        // 🔍 DEBUG: Check if ENV variables are loaded
               const params = new URLSearchParams({
            customerId: process.env.MESSAGECENTRAL_CUSTOMER_ID!,
            key: process.env.MESSAGECENTRAL_KEY!,
            scope: "NEW",
            country: "91", // Default to India
        });

        try {
            const res = await fetch(`${BASE_URL}/auth/v1/authentication/token?${params}`);
            const data: MCAuthResponse = await res.json();

            // 🔍 DEBUG: Log the Auth Response
            if (!res.ok || !data.token) {
                console.error("🔥 [MessageCentral] Auth Failed! Response:", JSON.stringify(data, null, 2));
                throw new Error(data.message || "Failed to retrieve MessageCentral Token");
            }

            // console.log("✅ [MessageCentral] Auth Token Generated Successfully.");
            return data.token;
        } catch (error) {
            console.error("🔥 [MessageCentral] Network/Auth Error:", error);
            throw error;
        }
    },

    /**
     * 2. Send OTP (Verify Now V3)
     */
    sendOtp: async (phone: string) => {
        // console.log(`🚀 [MessageCentral] Attempting to send OTP to: ${phone}`);

        const token = await messageCentral.getAuthToken();
        const url = `${BASE_URL}/verification/v3/send?countryCode=91&customerId=${process.env.MESSAGECENTRAL_CUSTOMER_ID}&flowType=SMS&mobileNumber=${phone}`;

        const res = await fetch(url, {
            method: "POST",
            headers: { authToken: token },
        });

        const data: MCSendResponse = await res.json();

        // 🔍 DEBUG: Log Send OTP Result
        if (data.responseCode !== 200) {
            console.error("🔥 [MessageCentral] Send OTP Failed:", JSON.stringify(data, null, 2));
            throw new Error(data.message || "Failed to send OTP via MessageCentral");
        }

        // console.log("✅ [MessageCentral] OTP Sent! Verification ID:", data.data.verificationId);
        return data.data.verificationId; // IMPORTANT: We need this ID to verify later
    },

    /**
     * 3. Validate OTP
     */
    validateOtp: async (phone: string, otp: string, verificationId: string) => {
        // console.log(`🔍 [MessageCentral] Verifying OTP: ${otp} for ID: ${verificationId}`);

        const token = await messageCentral.getAuthToken();
        const url = `${BASE_URL}/verification/v3/validateOtp?countryCode=91&mobileNumber=${phone}&verificationId=${verificationId}&customerId=${process.env.MESSAGECENTRAL_CUSTOMER_ID}&code=${otp}`;

        const res = await fetch(url, {
            method: "GET",
            headers: { authToken: token },
        });

        const data: MCVerifyResponse = await res.json();

        // 🔍 DEBUG: Log Verification Result
        // console.log("📩 [MessageCentral] Verification Response:", JSON.stringify(data, null, 2));

        if (data.data?.verificationStatus !== "VERIFICATION_COMPLETED") {
            console.warn("❌ [MessageCentral] OTP Invalid or Expired.");
            return false;
        }

        // console.log("✅ [MessageCentral] OTP Verified Successfully!");
        return true;
    },
};