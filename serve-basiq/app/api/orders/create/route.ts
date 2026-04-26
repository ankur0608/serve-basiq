import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const OrderSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
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
    console.log("📦 [Order API] Received Payload:", body);

    // 2. Validate with Zod
    const validation = OrderSchema.safeParse(body);

    if (!validation.success) {
      console.error("❌ Validation Failed:", validation.error.format());
      return NextResponse.json({ success: false, message: "Invalid data", errors: validation.error.format() }, { status: 400 });
    }

    const data = validation.data;
    let finalAddressId = data.addressId;

    if (data.addressId.startsWith("temp-")) {
      console.log("🆕 Detected New Address. Creating...");

      if (!data.newAddress) {
        return NextResponse.json({ success: false, message: "New address details missing." }, { status: 400 });
      }

      const createdAddress = await prisma.address.create({
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

      finalAddressId = createdAddress.id; // Use real ID
    }

    // 4. Fetch Product Details (Price, Unit, Name, and Seller Info)
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      // ✅ UPDATED: Added 'user' relation to get the seller's phone number and name
      include: {
        user: true 
      }
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    // 5. Calculate Total
    const totalPrice = product.price * data.quantity;

    // 6. Create Order
    const newOrder = await prisma.order.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        addressId: finalAddressId, // <--- The real address ID
        quantity: data.quantity,
        unit: product.unit,        // <--- Saved from Product DB
        totalPrice: totalPrice,    // <--- Calculated securely
        timeline: data.timeline,
        specialInstructions: data.specialInstructions,
        status: 'REQUESTED',
        paymentStatus: 'PENDING',
      },
      // ✅ UPDATED: Include the user to get the Customer's Name for WhatsApp
      include: {
        user: true
      }
    });

    console.log("🎉 [Order API] Order Created:", newOrder.id);

    // ==========================================
    // 📱 MSG91 WHATSAPP NOTIFICATION LOGIC
    // ==========================================
    
    // Note: Assuming `product.user` holds the seller's details. Adjust if your relation is named differently.
    const providerPhone = product.user?.phone; 
    console.log("📱 Extracted Seller Phone:", providerPhone);

    if (providerPhone) {
      let formattedPhone = providerPhone.replace(/\D/g, '');
      if (formattedPhone.length === 10) formattedPhone = `91${formattedPhone}`;

      console.log("📞 Formatted Phone for MSG91:", formattedPhone);

      const providerName = product.user?.name || product.user?.shopName || 'Seller';
      const customerName = newOrder.user?.name || 'A customer';
      const productName = product.name;

      console.log(`👤 Seller: ${providerName}, 👤 Customer: ${customerName}, 📦 Product: ${productName}`);

      const authKey = process.env.MSG91_AUTH_KEY;
      const waNumber = process.env.MSG91_WA_NUMBER;

      if (authKey && waNumber) {
        const payloadBody = {
          integrated_number: waNumber,
          content_type: 'template',
          payload: {
            messaging_product: 'whatsapp',
            type: 'template',
            template: {
              name: 'new_booking_alert', // You may want to create a new template called 'new_order_alert' in MSG91 later
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
                      value: productName, // Passing Product Name into the service_name variable
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
          const waRes = await fetch('https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/', msg91Options);
          const waData = await waRes.json();

          if (waData.hasError) {
            console.error("⚠️ MSG91 API Error detected in response!");
          } else {
            console.log("✅ WhatsApp message successfully queued by MSG91!");
          }
        } catch (msgError) {
          console.error('🔥 Failed to send WhatsApp notification:', msgError);
        }
      } else {
        console.warn("⚠️ Missing MSG91_AUTH_KEY or MSG91_WA_NUMBER in environment variables.");
      }
    } else {
      console.log("ℹ️ No seller phone number found, skipping WhatsApp notification.");
    }

    // ==========================================

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      orderId: newOrder.id
    });

  } catch (error) {
    console.error("🔥 [Order API] Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}