import { NextResponse } from 'next/server';
const comments: any[] = [];
export async function GET(req: Request) {
  const articleId = new URL(req.url).searchParams.get('articleId');
  return NextResponse.json(articleId ? comments.filter(c => c.articleId === articleId) : comments);
}
export async function POST(req: Request) {
  try {
    const { articleId, name, text } = await req.json();
    if (!articleId || !name || !text) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    comments.push({ id: String(Date.now()), articleId, name, text, date: new Date().toISOString() });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}