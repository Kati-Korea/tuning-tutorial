import { adminDb } from '@/lib/firebase-admin';
import Link from 'next/link';

async function getGuides() {
  try {
    const snapshot = await adminDb.collection('guides').get();
    const guides = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return guides;
  } catch (error) {
    console.error('Error fetching guides:', error);
    return [];
  }
}

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            튜닝 가이드
          </h1>
          <p className="text-lg text-gray-600">
            총 {guides.length}개의 가이드
          </p>
        </header>

        {guides.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">아직 가이드가 없습니다.</p>
            <p className="text-gray-400 mt-2">
              n8n 워크플로우를 실행해서 가이드를 생성하세요!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide: any) => (
              <Link
                key={guide.id}
                href={`/guides/${guide.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex gap-2 mb-3">
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded">
                    {guide.levelId}
                  </span>
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">
                    {guide.categoryId}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {guide.title}
                </h2>

                {guide.summary && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {guide.summary}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{guide.blocks?.length || 0}개 블록</span>
                  <span>
                    {new Date(guide.updatedAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>

                {guide.tags && guide.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-3">
                    {guide.tags.slice(0, 3).map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                    {guide.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{guide.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
