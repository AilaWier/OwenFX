import { NextResponse } from 'next/server';

type CommentItem = {
  id: string;
  articleId: string;
  name: string;
  text: string;
  date: string;
  avatar_url: string | null;
  userId: string | null;
};

const comments: CommentItem[] = [];

export async function GET(req: Request) {
  const articleId = new URL(req.url).searchParams.get('articleId');
  return NextResponse.json(articleId ? comments.filter(c => c.articleId === articleId) : comments);
}
export async function POST(req: Request) {
  try {
    const { articleId, name, text, avatar_url, userId } = await req.json();
    if (!articleId || !name || !text) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const comment: CommentItem = {
      id: String(Date.now()),
      articleId,
      name,
      text,
      date: new Date().toISOString(),
      avatar_url: typeof avatar_url === 'string' ? avatar_url : null,
      userId: typeof userId === 'string' ? userId : null,
    };
    comments.push(comment);
    return NextResponse.json({ success: true, comment });
  } catch { return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
