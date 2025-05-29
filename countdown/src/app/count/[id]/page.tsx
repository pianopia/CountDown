'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Lottie from 'lottie-react';
import celebrationAnimation from '../../../../public/animations/celebration.json';
import Image from 'next/image';

type Countdown = {
  id: number;
  name: string;
  targetValue: number;
  currentValue: number;
  createdAt: string;
  updatedAt: string;
};

type CountPageParams = {
  params: {
    id: string;
  };
};

export default function CountPage({ params }: CountPageParams) {
  const router = useRouter();
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const [currentValueInput, setCurrentValueInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const prevCurrentValueRef = useRef<number | null>(null);
  
  // Next.jsの警告を回避するためにparamsから明示的に取り出す
  const id = params.id;

  const fetchCountdown = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/count/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/');
          return;
        }
        const error = await response.json();
        throw new Error(error.error || 'カウントアップの取得に失敗しました');
      }
      
      const data = await response.json();
      setCountdown(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'カウントアップの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  // 目標達成時にお祝いを表示
  useEffect(() => {
    console.log('Countdown state changed:', {
      current: countdown?.currentValue,
      target: countdown?.targetValue,
      previous: prevCurrentValueRef.current
    });
    
    if (countdown) {
      // 目標達成判定を強化
      const reachedTarget = countdown.currentValue === countdown.targetValue;
      const valueChanged = prevCurrentValueRef.current !== countdown.currentValue;
      
      console.log('Target reached check:', {
        reachedTarget,
        valueChanged,
        showCelebration
      });
      
      if (valueChanged && reachedTarget) {
        console.log('🎉 Goal reached! Showing celebration animation');
        setShowCelebration(true);
        
        // 5秒後にお祝いアニメーションを非表示（時間を延長）
        const timer = setTimeout(() => {
          console.log('Hiding celebration animation');
          setShowCelebration(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
      
      // 目標値から離れた場合はお祝いアニメーションを非表示
      if (valueChanged && !reachedTarget && showCelebration) {
        console.log('No longer at target value, hiding celebration');
        setShowCelebration(false);
      }
      
      // 現在の値を記録
      prevCurrentValueRef.current = countdown.currentValue;
    }
  }, [countdown, showCelebration]);

  useEffect(() => {
    if (!id) return;
    
    // 初回読み込み
    fetchCountdown();
    
    // SSEの設定
    const eventSource = new EventSource(`/api/count/${id}/events`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          setError(data.error);
        } else {
          setCountdown(data);
          setError('');
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };
    
    eventSource.onerror = () => {
      setError('サーバーとの接続が切断されました');
      eventSource.close();
    };
    
    // クリーンアップ関数
    return () => {
      eventSource.close();
    };
  }, [id, fetchCountdown]);

  const handleIncrement = async () => {
    if (!countdown) return;
    
    try {
      // クライアント側で値の上限を確認
      if (countdown.currentValue >= countdown.targetValue) return;
      
      const response = await fetch(`/api/count/${countdown.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ increment: true }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '更新に失敗しました');
      }
      
      const data = await response.json();
      
      // 目標値に達した場合、お祝いアニメーションを表示
      if (data.currentValue === data.targetValue) {
        console.log('🎉 Goal reached in handleIncrement!');
        setShowCelebration(true);
        // 5秒後に非表示
        setTimeout(() => setShowCelebration(false), 5000);
      }
      
      setCountdown(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました');
      console.error(err);
    }
  };

  const handleReset = async () => {
    if (!countdown) return;
    
    try {
      const response = await fetch(`/api/count/${countdown.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentValue: 0 }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'リセットに失敗しました');
      }
      
      const data = await response.json();
      setCountdown(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'リセットに失敗しました');
      console.error(err);
    }
  };

  const handleSetCurrentValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!countdown || !currentValueInput) return;
    
    try {
      const newValue = parseInt(currentValueInput);
      if (isNaN(newValue) || newValue < 0 || newValue > countdown.targetValue) return;
      
      const response = await fetch(`/api/count/${countdown.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentValue: newValue }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '更新に失敗しました');
      }
      
      const data = await response.json();
      
      // 目標値に達した場合、お祝いアニメーションを表示
      if (data.currentValue === data.targetValue) {
        console.log('🎉 Goal reached in handleSetCurrentValue!');
        setShowCelebration(true);
        // 5秒後に非表示
        setTimeout(() => setShowCelebration(false), 5000);
      }
      
      setCountdown(data);
      setCurrentValueInput('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました');
      console.error(err);
    }
  };

  // 数値を桁ごとに分割する関数
  const getDigits = (num: number): number[] => {
    return num.toString().split('').map(Number);
  };

  if (loading && !countdown) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="text-center">
          <p className="text-2xl text-gray-600">読み込み中...</p>
        </div>
      </main>
    );
  }

  if (!countdown) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="text-center">
          <p className="text-2xl text-red-600 mb-4">カウントアップが見つかりません</p>
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md font-bold transition duration-200">
            トップページに戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 flex items-center">
            ← 戻る
          </Link>
          <h1 className="text-3xl font-bold text-blue-800">{countdown.name}</h1>
          <div className="w-24"></div> {/* スペーサー */}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="relative w-full">
          <div className="absolute right-0 bottom-0 transform translate-y-1/4">
            <Image 
              src="/ninty.png" 
              alt="キャラクター" 
              width={150} 
              height={150} 
              className="z-10"
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md mb-8 text-center relative">
          <p className="text-lg text-gray-600 mb-4">目標: {countdown.targetValue}</p>
          
          <div className="flex justify-center gap-2 mb-6">
            {getDigits(countdown.currentValue).map((digit, index) => (
              <div key={index} className="flex items-center justify-center w-24 h-32 bg-white border-2 border-blue-500 rounded-lg shadow-lg text-8xl font-bold text-blue-700 mb-10 mt-10">
                {digit}
              </div>
            ))}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div 
              className="bg-blue-600 h-4 rounded-full" 
              style={{ width: `${Math.min(100, Math.round((countdown.currentValue / countdown.targetValue) * 100))}%` }}
            ></div>
          </div>
          
          <p className="text-lg text-gray-600 mb-6">
            進捗: {countdown.currentValue} / {countdown.targetValue}
            （{Math.round((countdown.currentValue / countdown.targetValue) * 100)}%）
          </p>
          
          {/* お祝いアニメーション */}
          {showCelebration && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none" style={{ background: 'rgba(255,255,255,0.7)' }}>
              <div className="w-full h-full max-w-lg">
                <Lottie
                  animationData={celebrationAnimation}
                  loop={true}
                  autoplay={true}
                  rendererSettings={{
                    preserveAspectRatio: 'xMidYMid slice'
                  }}
                  style={{ width: '100%', height: '100%' }}
                />
                <div className="text-center mt-4">
                  <h2 className="text-2xl font-bold text-blue-800">おめでとう！目標達成！</h2>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-2 text-blue-700">カウントアップ情報</h2>
          <dl className="grid grid-cols-[120px_1fr] gap-2">
            <dt className="text-gray-600">ID:</dt>
            <dd>{countdown.id}</dd>
            <dt className="text-gray-600">作成日時:</dt>
            <dd>{new Date(countdown.createdAt).toLocaleString()}</dd>
            <dt className="text-gray-600">更新日時:</dt>
            <dd>{new Date(countdown.updatedAt).toLocaleString()}</dd>
          </dl>

          <form onSubmit={handleSetCurrentValue} className="flex gap-2 justify-center mb-8 mt-16">
            <input
              type="number"
              value={currentValueInput}
              onChange={(e) => setCurrentValueInput(e.target.value)}
              className="border p-2 rounded shadow-sm w-32"
              placeholder="現在値を入力"
              min="0"
              max={countdown.targetValue}
            />
            <button 
              type="submit" 
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded shadow-md transition duration-200"
            >
              値をセット
            </button>
          </form>
          
          <h2 className="text-xl font-bold mb-2 text-blue-700">カウントアップ操作</h2>
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleIncrement}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg shadow-md font-bold transition duration-200"
            >
              カウントアップ
            </button>
            <button 
              onClick={handleReset}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg shadow-md font-bold transition duration-200"
            >
              リセット
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 