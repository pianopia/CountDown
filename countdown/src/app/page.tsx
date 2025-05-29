'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Countdown = {
  id: number;
  name: string;
  targetValue: number;
  currentValue: number;
  createdAt: string;
  updatedAt: string;
};

export default function Home() {
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [name, setName] = useState('');
  const [targetValue, setTargetValue] = useState('100');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCountdowns();
  }, []);

  const fetchCountdowns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/count');
      const data = await response.json();
      setCountdowns(data);
      setError('');
    } catch (err) {
      setError('カウントアップの取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('/api/count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          targetValue: parseInt(targetValue) 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || '作成に失敗しました');
      }

      const newCountdown = await response.json();
      setCountdowns([...countdowns, newCountdown]);
      setName('');
      setTargetValue('100');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '作成に失敗しました');
      console.error('Creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('このカウントアップを削除してもよろしいですか？')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/count/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '削除に失敗しました');
      }
      
      setCountdowns(countdowns.filter(countdown => countdown.id !== id));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-800">カウントアップチャレンジ</h1>
        
        {/* 新規作成フォーム */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">新規カウントアップ作成</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 mb-1">名前</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border p-2 rounded shadow-sm"
                placeholder="カウントアップの名前"
                required
              />
            </div>
            <div>
              <label htmlFor="targetValue" className="block text-gray-700 mb-1">目標値</label>
              <input
                id="targetValue"
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full border p-2 rounded shadow-sm"
                placeholder="目標値"
                min="1"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-md transition duration-200"
              disabled={loading}
            >
              作成
            </button>
          </form>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {/* カウントアップ一覧 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">カウントアップ一覧</h2>
          
          {loading && countdowns.length === 0 ? (
            <p className="text-center text-gray-500 py-4">読み込み中...</p>
          ) : countdowns.length === 0 ? (
            <p className="text-center text-gray-500 py-4">カウントアップがありません。新しく作成してください。</p>
          ) : (
            <div className="grid gap-4">
              {countdowns.map((countdown) => (
                <div key={countdown.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-bold text-lg">{countdown.name}</h3>
                    <p className="text-gray-600">
                      進捗: {countdown.currentValue} / {countdown.targetValue}
                      （{Math.round((countdown.currentValue / countdown.targetValue) * 100)}%）
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/count/${countdown.id}`}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow-sm transition duration-200"
                    >
                      表示
                    </Link>
                    <button
                      onClick={() => handleDelete(countdown.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-sm transition duration-200"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
