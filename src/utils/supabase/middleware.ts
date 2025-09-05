import {createServerClient} from '@supabase/ssr'
import {NextResponse, type NextRequest} from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options),
                    );
                },
            },
        },
    );

    // Fetch the user ONCE and reuse to avoid multiple session touches
    let user: { id: string } | null = null;
    try {
        const { data: { user: u } } = await supabase.auth.getUser();
        user = (u as any) || null;
    } catch {
        // ignore - unauthenticated or transient cookie desync
        console.warn('Failed to fetch user');
    }

    // If the user is logged in, they can't go to the login or signup page
    const isAuthRoute =
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/signup') ||
        request.nextUrl.pathname.startsWith('/sign-up');

    if (isAuthRoute && user) {
        // Build redirect relative to current request origin to avoid base URL issues
        const url = new URL('/', request.url);
        const redirectResponse = NextResponse.redirect(url);
        // Copy cookies from the Supabase bridge to keep session in sync on Edge
        for (const c of supabaseResponse.cookies.getAll()) {
            redirectResponse.cookies.set(c);
        }
        return redirectResponse;
    }

    // Avoid note routing logic in middleware; let the page handle note selection/creation

    return supabaseResponse;
}
