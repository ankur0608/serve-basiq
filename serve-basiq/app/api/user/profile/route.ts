// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

// export const dynamic = 'force-dynamic';

// export async function GET(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     // @ts-ignore
//     const userId = session.user.id;

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       include: {
//         // ✅ Get all addresses, newest first
//         addresses: { orderBy: { createdAt: 'desc' } },
//         orders: { take: 5 },
//         bookings: {
//           orderBy: { createdAt: 'desc' }
//         }
//       },
//     });

//     if (!user) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 });
//     }

//     const primaryAddress =
//       user.addresses.find((addr) => addr.type === "Home") ||
//       user.addresses[0] ||
//       {};
//     const val = (v: any) => (v === null || v === undefined ? "" : v);

//     const formattedDob = user.dob
//       ? new Date(user.dob).toISOString().split('T')[0]
//       : "";

//     const finalUserData = {
//       id: user.id,
//       name: val(user.name),
//       email: val(user.email),
//       phone: val(user.phone),
//       img: val(user.image),
//       image: val(user.image),
//       profileImage: val(user.profileImage), // 👉 ADDED: Sends profileImage to the frontend
//       dob: formattedDob,
//       dateOfBirth: formattedDob,
//       preferredLanguage: val(user.preferredLanguage) || "English",
//       role: user.role,
//       providerType: user.providerType,
//       isWorker: user.isWorker,
//       isonline: user.isOnline, // ✅ ADDED: Send isOnline status to frontend
//       isPhoneVerified: user.isPhoneVerified,

//       addressLine1: val(primaryAddress.line1),
//       addressLine2: val(primaryAddress.line2),
//       landmark: val(primaryAddress.landmark),
//       city: val(primaryAddress.city),
//       state: val(primaryAddress.state),
//       district: val(primaryAddress.district),
//       pincode: val(primaryAddress.pincode),
//       country: val(primaryAddress.country) || "India",

//       addresses: user.addresses,
//       bookings: user.bookings,
//       isFullProfile: true
//     };

//     return NextResponse.json(finalUserData);

//   } catch (error) {
//     console.error("🔥 [API] GET Error:", error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

// export async function PATCH(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//     const body = await request.json();
//     const userId = session.user.id;

//     const {
//       id, // Address ID (from AddressEditModal)
//       type, // Address Type
//       name, email, phone, dateOfBirth, dob, preferredLanguage, profileImage, image,
//       addressLine1, addressLine2, landmark, city, state, district, pincode, country
//     } = body;

//     // 1. Update User Data
//     const userUpdateData: any = {};
//     if (name) userUpdateData.name = name;
//     if (email) userUpdateData.email = email;
//     if (phone) userUpdateData.phone = phone;

//     // 👉 UPDATED: Save manual uploads to `profileImage` to prevent overwriting OAuth images
//     if (profileImage || image) userUpdateData.profileImage = profileImage || image;

//     const dobValue = dateOfBirth || dob;
//     if (dobValue) userUpdateData.dob = new Date(dobValue);
//     if (preferredLanguage) userUpdateData.preferredLanguage = preferredLanguage;

//     if (Object.keys(userUpdateData).length > 0) {
//       try {
//         await prisma.user.update({ where: { id: userId }, data: userUpdateData });
//       } catch (err: any) {
//         // ✅ CATCH UNIQUE CONSTRAINT ERRORS (P2002)
//         if (err.code === 'P2002') {
//           const field = err.meta?.target?.[0] || 'Field';
//           return NextResponse.json(
//             { error: `This ${field} is already associated with another account.` },
//             { status: 400 }
//           );
//         }
//         throw err;
//       }
//     }

//     // 2. Update Address Data
//     const hasAddressData = addressLine1 || city || state || pincode || district;

//     if (hasAddressData) {
//       const addressData = {
//         type: type || 'Home',
//         line1: addressLine1 || '',
//         line2: addressLine2 || '',
//         landmark: landmark || '',
//         city: city || '',
//         district: district || '',
//         state: state || '',
//         pincode: pincode || '',
//         country: country || 'India'
//       };

//       if (id) {
//         await prisma.address.update({
//           where: { id: id },
//           data: addressData
//         });
//       } else {
//         const existingAddress = await prisma.address.findFirst({
//           where: { userId },
//           orderBy: { createdAt: 'desc' }
//         });

//         if (existingAddress) {
//           await prisma.address.update({
//             where: { id: existingAddress.id },
//             data: addressData
//           });
//         } else {
//           await prisma.address.create({
//             data: {
//               userId,
//               ...addressData
//             }
//           });
//         }
//       }
//     }

//     return NextResponse.json({ success: true });
//   } catch (error: any) {
//     console.error("🔥 [API] PATCH Error:", error);
//     return NextResponse.json({ error: 'Update failed' }, { status: 500 });
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || !session.user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const body = await request.json();
//     const { action, name, userId: bodyUserId } = body;

//     const sessionUserId = session.user.id;
//     if (sessionUserId !== bodyUserId) {
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     if (action === "UPDATE_NAME") {
//       if (!name || name.trim().length < 2) {
//         return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
//       }

//       await prisma.user.update({
//         where: { id: sessionUserId },
//         data: { name: name.trim() },
//       });

//       return NextResponse.json({ success: true, message: "Name updated" });
//     }

//     return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

//   } catch (error) {
//     console.error("🔥 [API] POST Error:", error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

// api/user/profile/route.ts — complete updated file

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// ✅ Shared validation
const NAME_REGEX = /^[a-zA-Z\s\-']{2,50}$/;

function normalizePhone(raw: string): string {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length === 12) return digits.slice(2);
    return digits.slice(-10);
}

// ─────────────────────────────────────────────
// GET /api/user/profile
// ─────────────────────────────────────────────
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // @ts-ignore
        const userId = session.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                addresses: { orderBy: { createdAt: 'desc' } },
                orders: { take: 5 },
                bookings: { orderBy: { createdAt: 'desc' } },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const primaryAddress =
            user.addresses.find((addr) => addr.type === "Home") ||
            user.addresses[0] ||
            {} as any;

        const val = (v: any) => (v === null || v === undefined ? "" : v);
        const formattedDob = user.dob
            ? new Date(user.dob).toISOString().split('T')[0]
            : "";

        return NextResponse.json({
            id: user.id,
            name: val(user.name),
            email: val(user.email),
            phone: val(user.phone),
            img: val(user.image),
            image: val(user.image),
            profileImage: val(user.profileImage),
            dob: formattedDob,
            dateOfBirth: formattedDob,
            preferredLanguage: val(user.preferredLanguage) || "English",
            role: user.role,
            isWorker: user.isWorker,
            isonline: user.isOnline,
            isPhoneVerified: user.isPhoneVerified,
            addressLine1: val(primaryAddress.line1),
            addressLine2: val(primaryAddress.line2),
            landmark: val(primaryAddress.landmark),
            city: val(primaryAddress.city),
            state: val(primaryAddress.state),
            district: val(primaryAddress.district),
            pincode: val(primaryAddress.pincode),
            country: val(primaryAddress.country) || "India",
            addresses: user.addresses,
            bookings: user.bookings,
            isFullProfile: true,
        });

    } catch (error) {
        console.error("🔥 [API] GET Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// PATCH /api/user/profile
// ─────────────────────────────────────────────
export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // @ts-ignore
        const userId = session.user.id;
        const body = await request.json();

        const {
            id, type,
            name, email, phone,
            dateOfBirth, dob,
            preferredLanguage, profileImage, image,
            addressLine1, addressLine2, landmark,
            city, state, district, pincode, country,
        } = body;

        // ── 1. Build + validate user update payload ───────────────────────
        const userUpdateData: Record<string, any> = {};

        if (name !== undefined) {
            const trimmed = String(name).trim();
            if (trimmed.length < 2 || !NAME_REGEX.test(trimmed)) {
                return NextResponse.json(
                    { error: "Names can only contain letters, spaces, or hyphens (2–50 chars)" },
                    { status: 400 }
                );
            }
            userUpdateData.name = trimmed;
        }

        if (email !== undefined) {
            const trimmed = String(email).trim().toLowerCase();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
            }
            userUpdateData.email = trimmed;
        }

        if (phone !== undefined) {
            const normalized = normalizePhone(String(phone));
            if (normalized.length !== 10) {
                return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
            }
            userUpdateData.phone = normalized;
        }

        if (profileImage || image) {
            userUpdateData.profileImage = profileImage || image;
        }

        const dobValue = dateOfBirth || dob;
        if (dobValue) {
            const parsed = new Date(dobValue);
            if (isNaN(parsed.getTime())) {
                return NextResponse.json({ error: "Invalid date of birth" }, { status: 400 });
            }
            // ✅ Reject future dates
            if (parsed > new Date()) {
                return NextResponse.json({ error: "Date of birth cannot be in the future" }, { status: 400 });
            }
            userUpdateData.dob = parsed;
        }

        if (preferredLanguage !== undefined) {
            const allowed = [
                "English", "Hindi", "Gujarati", "Marathi",
                "Tamil", "Telugu", "Kannada", "Bengali", "Punjabi"
                // add whatever your dropdown has
            ]; if (!allowed.includes(preferredLanguage)) {
                return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
            }
            userUpdateData.preferredLanguage = preferredLanguage;
        }

        if (Object.keys(userUpdateData).length > 0) {
            try {
                await prisma.user.update({ where: { id: userId }, data: userUpdateData });
            } catch (err: any) {
                if (err.code === "P2002") {
                    const field = err.meta?.target?.[0] || "Field";
                    return NextResponse.json(
                        { error: `This ${field} is already associated with another account.` },
                        { status: 400 }
                    );
                }
                throw err;
            }
        }

        // ── 2. Address update ─────────────────────────────────────────────
        const hasAddressData = addressLine1 || city || state || pincode || district;

        if (hasAddressData) {
            // ✅ Basic address field length guards
            if (pincode && !/^\d{6}$/.test(String(pincode))) {
                return NextResponse.json({ error: "Invalid pincode (must be 6 digits)" }, { status: 400 });
            }

            const addressData = {
                type: type || "Home",
                line1: addressLine1 || "",
                line2: addressLine2 || "",
                landmark: landmark || "",
                city: city || "",
                district: district || "",
                state: state || "",
                pincode: pincode || "",
                country: country || "India",
            };

            if (id) {
                // ✅ Ownership check — prevent editing another user's address
                const existing = await prisma.address.findUnique({ where: { id } });
                if (!existing || existing.userId !== userId) {
                    return NextResponse.json({ error: "Address not found" }, { status: 404 });
                }
                await prisma.address.update({ where: { id }, data: addressData });
            } else {
                const existingAddress = await prisma.address.findFirst({
                    where: { userId },
                    orderBy: { createdAt: "desc" },
                });

                if (existingAddress) {
                    await prisma.address.update({
                        where: { id: existingAddress.id },
                        data: addressData,
                    });
                } else {
                    await prisma.address.create({
                        data: { userId, ...addressData },
                    });
                }
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("🔥 [API] PATCH Error:", error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// POST /api/user/profile
// ─────────────────────────────────────────────
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, name, userId: bodyUserId } = body;

        // @ts-ignore
        const sessionUserId = session.user.id;

        // ✅ Always verify the session user matches the requested userId
        if (sessionUserId !== bodyUserId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (action === "UPDATE_NAME") {
            const trimmed = String(name ?? "").trim();

            if (trimmed.length < 2) {
                return NextResponse.json(
                    { error: "Please enter a valid name (at least 2 characters)" },
                    { status: 400 }
                );
            }
            // ✅ Server-side name regex — mirrors frontend but enforced here
            if (!NAME_REGEX.test(trimmed)) {
                return NextResponse.json(
                    { error: "Names can only contain letters, spaces, or hyphens" },
                    { status: 400 }
                );
            }

            await prisma.user.update({
                where: { id: sessionUserId },
                data: { name: trimmed },
            });

            return NextResponse.json({ success: true, message: "Name updated" });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error("🔥 [API] POST Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}