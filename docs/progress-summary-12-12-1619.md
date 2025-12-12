# 작업 요약 보고서 (12/12 금 16:19)

## 변경된 JSON 구조

- 어제(c2a78d4, 계층형 섹션): `documentId`, `sections(Section[])`, `html`, `metadata`, `createdAt`, `updatedAt` / `Section { level, title, content, children[] }` (파일: `src/app/api/parse-markdown/route.ts`)
- 오늘(플랫 블록 + 메타 최소화): `id`, `levelId`, `categoryId`, `title`, `slug`, `blocks(ContentBlock[])`, `summary?`, `tags?`, `status`, `createdAt`, `updatedAt` (파일: `schema/tuning-guide.schema.json`, `src/types/tuning-guide.types.ts`, `src/app/api/parse-markdown/route-v2.ts`)
- 핵심 변화: 섹션 트리 → 블록 배열, `levelName/categoryName/html/orderNum` 제거, `status/tags/summary` 도입, `id = {levelId}_{categoryId}_{slug}`, 헤딩에서 slug/id 생성, 광고 블록 자동 삽입(top/middle/bottom)

## n8n 상황

- 워크플로우 개편: Google Docs → 블록 배열 변환 → 메타 생성 + 광고 삽입 → Firestore 저장 (문서: `docs/n8n-workflow-improved.md`, `docs/n8n-with-remark.md`, `docs/n8n-pipeline-guide.md`, `docs/n8n-test-guide.md`, `docs/n8n-simple-version.md`)
- 두 방식 병행 정리:
  - API 경유(기존): `POST /api/parse-markdown`(계층형, 과거 구조), `POST /api/parse-markdown/route-v2.ts`(블록 구조)
  - Admin SDK 직접 저장(추천): n8n 코드 노드에서 `firebase-admin` 사용해 `guides/{id}`에 `guide` 저장
- 블록 파서: remark 기반(권장, 일관성)과 순수 JS(단순 문서용) 둘 다 가이드 정리
- 테스트 가이드/체크리스트 제공: 설치 패키지, 각 노드 코드, Firestore 확인, Next.js 렌더링 확인까지 문서화 완료

## 에러난 상황

- n8n `.first()` 사용 에러: `runOnceForEachItem` 모드에서 `.first()` 불가 → 특정 노드 참조 또는 메타데이터를 최초 노드에서 주입하도록 수정 (문서: `docs/n8n-error-fix.md`)
- 한글 URL 404 디버깅: 섹션 라우팅 시 `params.section`과 헤딩 `id` 일치 여부 로깅/검증 추가, `next/link`로 이동 처리 정비 (`src/app/guides/[id]/[section]/page.tsx`의 로깅, `GuideLayout`의 `Link`)
- 기타 주의: 클라이언트에서 Admin SDK 사용 금지 준수(현재 Admin SDK는 서버 라우트/서버 컴포넌트에서만 사용), 클라이언트용 Firestore 읽기는 `src/lib/firebase.ts`로 분리

## 서버 렌더링

- 리스트/상세/섹션 페이지: Firestore Admin SDK로 SSR 구현
  - 리스트: `src/app/guides/page.tsx`(전체 가이드 목록)
  - 가이드 엔트리: `src/app/guides/[id]/page.tsx`(섹션 분할 후 첫 섹션으로 redirect)
  - 섹션 상세: `src/app/guides/[id]/[section]/page.tsx`(H1/H2 기준 섹션 분할, 섹션 단위 SSR)
- 레이아웃/네비게이션: 목차(TOC) 생성, 이전/다음 섹션 네비게이션, 광고 영역 슬롯 제공 (`src/components/GuideLayout.tsx`)
- 블록 렌더링: `GuideRenderer`가 `ContentBlock[]` 전 타입 지원(heading/paragraph/list/image/quote/table/video/divider/ad), 스타일/접근성 보강

## 부가적 상황

- 타입/스키마 정리: 최종 스키마(`schema/tuning-guide.schema.json`)와 타입(`src/types/tuning-guide.types.ts`) 확정, `toViewModel`로 level/category 한글 매핑, TOC/읽기 시간 생성
- 광고 블록 자동 삽입: H2 이후 top, 중간 middle, 마지막 bottom 삽입 로직 구현 (`route-v2.ts` 및 n8n 코드 예시)
- 위키독스 스타일 섹션별 URL 라우팅: H1/H2로 자연 분할, 섹션 목차/URL 구성 완료
- 이미지/비디오/테이블 렌더링: 블록 타입 지원 및 기본 스타일링 반영
- 참고/프로토: 과거 `MarkdownRenderer`, `FirestoreRenderer`는 프로토타입으로 유지(SSR 경로는 블록 렌더링으로 전환)

## 오늘(12/12 금 16:19) 기준 완료 체크

- JSON 스키마 재설계(ब्ल록 기반) 및 타입/스키마 파일 반영
- n8n 워크플로우 코드/문서 정리(remark/순수JS 양쪽 가이드, 에러 해결 포함)
- 섹션별 URL 라우팅(위키독스 스타일) 완료
- 한글 URL 404 관련 대응(Link 기반 네비, 섹션 id/route 매칭 로깅)
- 목차 및 이전/다음 네비게이션 구현
- 광고 블록 자동 삽입 로직 반영
- Firestore에서 SSR로 목록/상세/섹션 렌더링 구현

