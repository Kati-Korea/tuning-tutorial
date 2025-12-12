# Remark 통합 가이드

## 🎯 목표

```
Google Docs → Markdown → Remark AST → React Component → Firestore
```

---

## 📦 설치 완료

```bash
✅ remark
✅ remark-parse
✅ remark-html
✅ unified
✅ react-markdown
✅ rehype-raw
✅ rehype-sanitize
```

---

## 🔧 Step 1: Markdown 렌더링 컴포넌트 생성

### `src/components/MarkdownRenderer.tsx`

```typescript
'use client';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // 커스텀 컴포넌트
          h1: ({ node, ...props }) => (
            <h1 className="text-4xl font-bold mb-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-3xl font-bold mb-3 mt-8" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-2xl font-bold mb-2 mt-6" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-4 leading-7" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-4" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-4" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="mb-2" {...props} />
          ),
          img: ({ node, ...props }) => (
            <img className="rounded-lg my-4" {...props} alt={props.alt || ''} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

---

## 🔧 Step 2: 테스트 페이지 생성

### `src/app/test-markdown/page.tsx`

```typescript
import MarkdownRenderer from '@/components/MarkdownRenderer';

const sampleMarkdown = `
# 1) 데칼 튜닝 가이드

데칼 튜닝은 차량 외부에 그래픽 디자인을 적용하여 개성을 표현하는 작업입니다.

## 1. 개요 및 주요 기능

데칼 튜닝은 차량의 외부에 그래픽 필름을 부착하여 다양한 색상과 무늬, 텍스트를 통해 스타일을 변화시키는 작업입니다.

## 2. 데칼 튜닝의 필요성

- 개성 표현: 데칼을 사용하면 차주가 원하는 스타일로 자동차 외관을 꾸밀 수 있습니다.
- 브랜드 홍보: 기업 차량의 경우 로고와 메시지를 부착하면 이동하는 동안 자연스럽게 브랜드 홍보 효과를 얻을 수 있습니다.
- 차체 보호: 자외선, 작은 긁힘, 돌 튀김 등으로부터 차량 페인트를 보호합니다.
`;

export default function TestMarkdownPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Markdown 렌더링 테스트</h1>
      <MarkdownRenderer content={sampleMarkdown} />
    </div>
  );
}
```

---

## 🔧 Step 3: Firestore에서 데이터 가져오기

### `src/lib/firestore.ts`

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export interface Guide {
  id: string;
  parentId: string;
  level: number;
  title: string;
  slug: string;
  type: string;
  sections: Section[];
  metadata: {
    sourceFileId: string;
    wordCount: number;
    sectionCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  type: 'heading' | 'paragraph' | 'list';
  level?: number;
  content?: string;
  style?: string;
  items?: string[];
}

export async function getGuide(guideId: string): Promise<Guide | null> {
  try {
    const docRef = doc(db, 'guides', guideId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as Guide;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching guide:', error);
    return null;
  }
}

export function sectionsToMarkdown(sections: Section[]): string {
  let markdown = '';
  
  for (const section of sections) {
    if (section.type === 'heading') {
      const level = section.level || 1;
      const hashes = '#'.repeat(level);
      markdown += `${hashes} ${section.content}\n\n`;
    } else if (section.type === 'paragraph') {
      markdown += `${section.content}\n\n`;
    } else if (section.type === 'list') {
      for (const item of section.items || []) {
        markdown += `- ${item}\n`;
      }
      markdown += '\n';
    }
  }
  
  return markdown;
}
```

---

## 🔧 Step 4: 가이드 페이지 생성

### `src/app/guides/[slug]/page.tsx`

```typescript
import { getGuide, sectionsToMarkdown } from '@/lib/firestore';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  
  // Firestore에서 가이드 가져오기
  const guide = await getGuide(slug);
  
  if (!guide) {
    notFound();
  }
  
  // Sections를 Markdown으로 변환
  const markdown = sectionsToMarkdown(guide.sections);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <article>
        <header className="mb-8">
          <h1 className="text-5xl font-bold mb-4">{guide.title}</h1>
          <div className="text-gray-600">
            <p>단어 수: {guide.metadata.wordCount}</p>
            <p>섹션 수: {guide.metadata.sectionCount}</p>
          </div>
        </header>
        
        <MarkdownRenderer content={markdown} />
      </article>
    </div>
  );
}
```

---

## 🔧 Step 5: 환경 변수 설정

### `.env.local` 생성

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=katia-tuning-tutorial.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=katia-tuning-tutorial
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=katia-tuning-tutorial.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 🚀 Step 6: 개발 서버 실행

```bash
npm run dev
```

**접속**: http://localhost:3000/test-markdown

---

## 📋 체크리스트

- [ ] Remark 패키지 설치 ✅
- [ ] MarkdownRenderer 컴포넌트 생성
- [ ] Firestore 연동 코드 작성
- [ ] 테스트 페이지 생성
- [ ] 환경 변수 설정
- [ ] 개발 서버 실행
- [ ] 렌더링 확인

---

## 🎯 다음 단계

1. **광고 삽입 로직**
   - 3문단마다 광고 컴포넌트 삽입

2. **이미지 최적화**
   - Next.js Image 컴포넌트 사용

3. **SEO 최적화**
   - 메타 태그 추가

---

## 🔌 n8n 통합 가이드

### 워크플로우 구조
```
Google Docs → Code (변환) → HTTP Request (Next.js API) → 결과 처리
```

### 노드 1: Get a document (Google Docs)
- **Document ID**: Google Docs 문서 ID 입력
- 출력: `documentId`, `content`

### 노드 2: Code in JavaScript (마크다운 변환)
```javascript
const item = $input.item.json;

return {
  json: {
    documentId: item.documentId,
    markdown: item.content  // 텍스트 그대로 전달
  }
};
```

### 노드 3: HTTP Request (Next.js API 호출)

**⚙️ 설정 방법:**

1. **Method**: `POST` 선택

2. **URL**:
   ```
   http://localhost:3000/api/parse-markdown
   ```

3. **Send Headers**: ON
   - **Add option** → **Header**
   - Name: `Content-Type`
   - Value: `application/json`

4. **Send Body**: ON
   - Body Content Type: **JSON** 선택
   - Body 입력:
   ```json
   {
     "markdown": "{{ $json.markdown }}"
   }
   ```

5. **Execute node** 클릭하여 테스트

### 노드 4: Code (결과 처리)
```javascript
const result = $input.item.json;

console.log('✅ 파싱 완료!');
console.log('HTML:', result.html);
console.log('단어 수:', result.metadata.wordCount);

// 제목만 추출
const headings = result.ast.children
  .filter(node => node.type === 'heading')
  .map(node => ({
    level: node.depth,
    text: node.children[0]?.value || ''
  }));

return {
  json: {
    documentId: $('Code in JavaScript').item.json.documentId,
    html: result.html,
    headings: headings,
    metadata: result.metadata
  }
};
```

### API 응답 구조
```json
{
  "success": true,
  "html": "<h1>제목</h1><p>내용...</p>",
  "ast": {
    "type": "root",
    "children": [...]
  },
  "metadata": {
    "characterCount": 150,
    "wordCount": 45
  }
}
```

### 테스트 방법
```bash
curl -X POST http://localhost:3000/api/parse-markdown \
  -H "Content-Type: application/json" \
  -d '{"markdown":"# 테스트\n\n내용입니다."}'
```

---

## 🌐 외부 접근 (팀 공유)

### 로컬 네트워크 vs 외부 네트워크

**현재 상황:**
- `http://localhost:3000` - 본인 컴퓨터만
- `http://192.168.0.32:3000` - 같은 Wi-Fi 네트워크만 (회사 동일 네트워크)

**팀장님이 집에서 접근하려면:**

### 방법 1: Vercel 배포 (추천 ✅)
```bash
# 코드 커밋 & 푸시
git add .
git commit -m "Add remark API"
git push

# Vercel 배포
vercel --prod
```

**n8n URL 변경:**
```
https://your-app.vercel.app/api/parse-markdown
```

### 방법 2: ngrok (임시 테스트)
```bash
# ngrok 설치
brew install ngrok

# 로컬 서버 노출 (Next.js 실행 중)
ngrok http 3000
```

**n8n URL 변경:**
```
https://abc123.ngrok.io/api/parse-markdown
```

⚠️ **ngrok 주의사항:**
- 무료 플랜: URL이 재시작할 때마다 변경됨
- 세션 제한: 2시간 후 재연결 필요
- 유료 플랜: 고정 URL 제공

### 방법 3: Firebase Hosting
```bash
npm run build
firebase deploy
```

**n8n URL 변경:**
```
https://katia-tuning-tutorial.web.app/api/parse-markdown
```

---

## 🔒 보안 고려사항

외부 공개 시 API에 인증 추가 권장:
```typescript
// route.ts에 추가
const authToken = request.headers.get('Authorization');
if (authToken !== `Bearer ${process.env.API_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

**작성자**: Jay
**작성일**: 2025-12-11
**업데이트**: 2025-12-11 (n8n 통합 가이드, 외부 접근 방법 추가)
