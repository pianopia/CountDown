import { NextResponse } from 'next/server';
import { db } from '@/db';
import { countdowns } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 事前にIDを解析して変数に格納
  const idParam = params.id;
  const parsedId = parseInt(idParam);
  
  // IDが無効な場合は早期にエラーレスポンスを返す
  if (isNaN(parsedId)) {
    return NextResponse.json({ error: '無効なID' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // 指定されたIDのカウントアップを取得する関数
      const sendCountdown = async () => {
        try {
          console.log(`Fetching countdown data for ID: ${parsedId}`);
          const result = await db.select().from(countdowns).where(eq(countdowns.id, parsedId)).limit(1);
          
          if (result.length === 0) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'カウントアップが見つかりません' })}\n\n`));
            return;
          }
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(result[0])}\n\n`));
        } catch (error) {
          console.error('Error fetching countdown:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'データ取得エラー' })}\n\n`));
        }
      };

      // 初回実行
      await sendCountdown();
      
      // 10秒ごとに実行するinterval
      const interval = setInterval(sendCountdown, 10000);

      return () => {
        clearInterval(interval);
      };
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 