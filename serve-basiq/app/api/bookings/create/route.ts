import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const BookingSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  serviceId: z.string().min(1, "Service ID is required"),
  addressId: z.string().min(1, "Address is required"),
  timeline: z.enum(['URGENT', 'IMMEDIATE', 'LATER', 'FLEXIBLE']),
  specialInstructions: z.string().optional(),
  newAddress: z.object({
    line1: z.string(),
    line2: z.string(),
    landmark: z.string().optional(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    type: z.enum(["HOME", "WORK", "OTHER"]).default("HOME"),
  }).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📝 [API] Booking Request:", body);

    const validation = BookingSchema.safeParse(body);

    if (!validation.success) {
      console.error("❌ Validation Failed:", validation.error.format());
      return NextResponse.json({ success: false, message: "Invalid data", errors: validation.error.format() }, { status: 400 });
    }

    console.log("✅ Validation passed");
    const data = validation.data;
    let finalAddressId = data.addressId;
    let createdAddress;

    if (data.addressId.startsWith("temp-")) {
      console.log("🆕 Detected New Address. Creating...");

      if (!data.newAddress) {
        return NextResponse.json({
          success: false,
          message: "New address selected but details missing."
        }, { status: 400 });
      }

      createdAddress = await prisma.address.create({
        data: {
          userId: data.userId,
          line1: data.newAddress.line1,
          line2: data.newAddress.line2,
          landmark: data.newAddress.landmark,
          city: data.newAddress.city,
          state: data.newAddress.state,
          pincode: data.newAddress.pincode,
          type: data.newAddress.type as any,
          country: "India",
        },
      });

      console.log("✅ Address Created with ID:", createdAddress.id);
      finalAddressId = createdAddress.id;
    }

    console.log("⏳ Creating booking in database...");
    const booking = await prisma.booking.create({
      data: {
        userId: data.userId,
        serviceId: data.serviceId,
        addressId: finalAddressId,
        timeline: data.timeline,
        specialInstructions: data.specialInstructions,
        status: 'REQUESTED',
      },
      include: {
        user: true, 
        service: {
          include: {
            user: true,
          }
        }
      }
    });
    console.log("🎉 Booking Created ID:", booking.id);

    const providerPhone = booking.service.user.phone;
    console.log("📱 Extracted Provider Phone:", providerPhone);

    if (providerPhone) {
      let formattedPhone = providerPhone.replace(/\D/g, '');
      if (formattedPhone.length === 10) formattedPhone = `91${formattedPhone}`;

      console.log("📞 Formatted Phone for MSG91:", formattedPhone);

      const providerName = booking.service.user.name || booking.service.user.shopName || 'Provider';
      const customerName = booking.user.name || 'A customer';
      const serviceName = booking.service.name;

      console.log(`👤 Provider: ${providerName}, 👤 Customer: ${customerName}, 🛠️ Service: ${serviceName}`);

      const authKey = process.env.MSG91_AUTH_KEY;
      const waNumber = process.env.MSG91_WA_NUMBER;

      if (authKey && waNumber) {
        // ✅ UPDATED PAYLOAD: Matches your MSG91 curl request perfectly
        const payloadBody = {
          integrated_number: waNumber,
          content_type: 'template',
          payload: {
            messaging_product: 'whatsapp',
            type: 'template',
            template: {
              name: 'new_booking_alert',
              language: {
                code: 'en',
                policy: 'deterministic'
              },
              namespace: 'ab2852b6_db9d_4746_932c_e66d6d7d2034',
              to_and_components: [
                {
                  to: [formattedPhone],
                  components: {
                    body_service_name: {
                      type: 'text',
                      value: serviceName,
                      parameter_name: 'service_name'
                    },
                    body_provider_name: {
                      type: 'text',
                      value: providerName,
                      parameter_name: 'provider_name'
                    },
                    body_customer_name: {
                      type: 'text',
                      value: customerName,
                      parameter_name: 'customer_name'
                    }
                  }
                }
              ]
            }
          }
        };

        console.log("🚀 Sending WhatsApp Request with payload:", JSON.stringify(payloadBody, null, 2));

        const msg91Options = {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'authkey': authKey
          },
          body: JSON.stringify(payloadBody)
        };

        try {
          console.log("⏳ Awaiting MSG91 response...");
          // ✅ UPDATED URL: Changed from control.msg91.com to api.msg91.com
          const waRes = await fetch('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/', msg91Options);
          const waData = await waRes.json();

          console.log("📨 MSG91 Full Response:", waData);

          if (waData.hasError) {
            console.error("⚠️ MSG91 API Error detected in response!");
          } else {
            console.log("✅ WhatsApp message successfully queued by MSG91!");
          }
        } catch (msgError) {
          console.error('🔥 Failed to send WhatsApp notification. Fetch threw an error:', msgError);
        }
      } else {
        console.warn("⚠️ Missing MSG91_AUTH_KEY or MSG91_WA_NUMBER in environment variables.");
      }
    } else {
      console.log("ℹ️ No provider phone number found, skipping WhatsApp notification.");
    }

    return NextResponse.json({ success: true, booking });

  } catch (error) {
    console.error("🔥 Server Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}