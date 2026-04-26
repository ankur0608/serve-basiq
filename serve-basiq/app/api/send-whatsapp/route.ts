import { NextRequest, NextResponse } from 'next/server';

// 1. Define the structure of the data coming from your frontend
interface WhatsAppRequestBody {
  phoneNumber: string;
  userName: string;
}

export async function POST(request: NextRequest) {
  try {
    // 2. Parse the incoming request and apply the interface
    const body: WhatsAppRequestBody = await request.json();
    const { phoneNumber, userName } = body;

    // 3. Grab your environment variables
    const authKey = process.env.MSG91_AUTH_KEY;
    const waNumber = process.env.MSG91_WA_NUMBER;

    // TypeScript safety check to ensure env variables exist
    if (!authKey || !waNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing MSG91 credentials in environment variables.' },
        { status: 500 }
      );
    }

    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authkey': authKey 
      },
      body: JSON.stringify({
        integrated_number: waNumber,
        content_type: 'template',
        payload: {
          type: 'template',
          template: {
            name: 'servebasiq_welcome', // Replace with your Meta-approved template name
            language: {
              code: 'en', // Match your template's language code
              policy: 'deterministic'
            },
            to_and_components: [
              {
                to: [phoneNumber], 
                components: {
                  body_1: {
                    type: 'text',
                    value: userName 
                  }
                }
              }
            ]
          }
        }
      })
    };

    // Send the request to MSG91
    const response = await fetch('https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/', options);
    const data = await response.json();

    // Check for MSG91 API errors
    if (data.hasError || data.type === 'error') {
      return NextResponse.json({ success: false, error: data }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    // Catch any unexpected server errors
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}