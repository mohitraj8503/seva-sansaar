import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

  try {
    const response = await fetch(url);
    const html = await response.text();
    
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) || html.match(/<meta\s+content="([^"]+)"\s+property="og:title"/i);
    const ogDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i) || html.match(/<meta\s+content="([^"]+)"\s+property="og:description"/i);
    const ogImgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) || html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i);
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);

    const metadata = {
      title: ogTitleMatch?.[1] || titleMatch?.[1] || url,
      description: ogDescMatch?.[1] || descMatch?.[1] || "",
      image: ogImgMatch?.[1] || null,
      url: url
    };

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Link preview error:', error);
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}
