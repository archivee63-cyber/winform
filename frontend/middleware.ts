import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: { user } } = await supabase.auth.getUser();

  // If user is not logged in, redirect to login
  if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/register') && !request.nextUrl.pathname.startsWith('/pricing')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check form creation limit for free users
  if (user && request.nextUrl.pathname.startsWith('/forms/create')) {
    const { data, error } = await supabase
      .from('users')
      .select('plan, forms_created, forms_limit')
      .eq('id', user.id)
      .single();

    if (data && data.plan === 'free' && data.forms_created >= data.forms_limit) {
      return NextResponse.redirect(new URL('/pricing?limit_reached=true', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};