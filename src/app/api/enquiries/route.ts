
import { NextRequest, NextResponse } from 'next/server';
import { enquirySchema } from '@/lib/schemas';
import { serverSupabase } from '@/lib/supabase/server';
import { TABLES } from '@/lib/constants';

export async function POST(req: NextRequest) {
  const declared = Number(req.headers.get('content-length') || 0);

  if (declared > 5120) {
    return NextResponse.json(
      { ok: false, error: 'Request body exceeds 5 KB' },
      { status: 413 }
    );
  }

  let raw: string;

  try {
    raw = await req.text();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Cannot read request body' },
      { status: 400 }
    );
  }

  if (Buffer.byteLength(raw, 'utf8') > 5120) {
    return NextResponse.json(
      { ok: false, error: 'Request body exceeds 5 KB' },
      { status: 413 }
    );
  }

  let payload: unknown;

  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON' },
      { status: 400 }
    );
  }

  const parsed = enquirySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message || 'Invalid form fields',
      },
      { status: 400 }
    );
  }

  const v = parsed.data;

  // Honeypot protection
  if (v.honeypot) {
    return NextResponse.json({ ok: true });
  }

  // Minimum three-second form completion time
  const elapsed = Date.now() - v.loaded_at;

  if (elapsed < 3000 || elapsed > 86400000 || elapsed < 0) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Please spend at least 3 seconds on the form and retry',
      },
      { status: 400 }
    );
  }

  try {
    const db = await serverSupabase();

    const { error } = await db.from(TABLES.enquiries).insert({
      property_id: v.property_id || null,
      name: v.name,
      phone: v.phone,
      email: v.email || null,
      preferred_date: v.preferred_date || null,
      message: v.message || null,
      enquiry_type: v.enquiry_type,
      status: 'new',
    });

    if (error) {
      // Development diagnostics: do not expose database errors to visitors.
      console.error('Meridian enquiry insert failed:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });

      return NextResponse.json(
        {
          ok: false,
          error: 'Could not save enquiry. Please try again.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error(
      'Meridian enquiry service failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );

    return NextResponse.json(
      { ok: false, error: 'Enquiry service is unavailable' },
      { status: 503 }
    );
  }
}
