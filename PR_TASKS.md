# Pull Request 작업 분류

**프로젝트**: 튜닝 가이드 자동화 시스템 - 프로토타입
**날짜**: 2025-12-08

---

## 📂 프로젝트 구조

```
tuning-tutorial/
├── COMPLETED_TASKS.md           # 전체 작업 내역 문서
├── docs/                         # 정적 웹앱 (GitHub Pages 배포 대상)
│   ├── index.html               # 메인 HTML
│   ├── css/
│   │   └── style.css            # 스타일시트
│   ├── js/
│   │   └── app.js               # 앱 로직
│   └── data/
│       └── data.json            # 샘플 데이터 (데칼 가이드)
└── n8n/                          # 자동화 워크플로우 설정
    ├── project_n8n_workflow.json    # n8n 노드 구성
    ├── target_schema.json           # JSON 스키마 정의
    └── parsing_prompt_system.md     # AI 파싱 프롬프트
```

---

# ✅ TASK 1: 완료된 작업 (Pull Request 가능)

## 1.1 정적 웹앱 프로토타입 구현

### 📍 관련 파일:
- [docs/index.html](docs/index.html)
- [docs/css/style.css](docs/css/style.css)
- [docs/js/app.js](docs/js/app.js)
- [docs/data/data.json](docs/data/data.json)

### ✅ 완료 내용:

#### A. HTML 구조 ([index.html](docs/index.html))
- WikiDocs 스타일의 2-column 레이아웃
- 사이드바 + 메인 콘텐츠 영역
- 메타데이터 헤더 (제목, 버전, 뱃지)
- 이전/다음 네비게이션 버튼
- Google Fonts (Noto Sans KR) 연동

#### B. 스타일시트 ([style.css](docs/css/style.css))
- CSS Variables로 테마 관리 (primary, accent, background 색상)
- 반응형 사이드바 (280px 고정폭)
- TOC 아이템 hover/active 상태 스타일
- 콘텐츠 블록 타입별 스타일:
  - `.block-text` - 일반 텍스트
  - `.block-image` - 이미지 + 캡션
  - `.block-callout` - 경고/팁 박스 (warning/tip 스타일)
  - `.block-list` - 리스트
- 광고 영역 플레이스홀더 (`.ad-placeholder`)
- 네비게이션 버튼 스타일

#### C. JavaScript 로직 ([app.js](docs/app.js))
- `fetch()` API로 외부 JSON 파일 로드
- Chapter 계층 구조 flatten (chapter → subsections)
- TOC 자동 생성 및 클릭 이벤트
- 콘텐츠 블록 동적 렌더링:
  - `text`, `image`, `callout`, `list` 타입 지원
  - 2블록마다 광고 삽입 로직
- 이전/다음 네비게이션 상태 관리
- Active 챕터 표시

#### D. 샘플 데이터 ([data.json](docs/data/data.json))
- 데칼 커스텀 가이드 콘텐츠 (3개 챕터)
  - Ch1: 자동차 데칼의 기원과 역사
  - Ch2: 데칼 필름의 소개 (3개 서브섹션)
  - Ch5: 데칼 시공의 과정과 기술
- 메타데이터 포함 (title, source_file, version)
- 블록 타입 예시: text, image, callout, list

### ✅ 기능 검증 완료:
- [x] JSON 데이터 로딩
- [x] TOC 자동 생성
- [x] 챕터 네비게이션 (이전/다음)
- [x] 콘텐츠 블록 렌더링
- [x] 스타일링 (폰트, 색상, 레이아웃)

### 📦 PR Commit Message (예시):
```
feat: Implement WikiDocs-style static web viewer prototype

- Add responsive 2-column layout with sidebar TOC
- Implement dynamic content block rendering (text, image, callout, list)
- Add sample data (Decal Tuning Guide) with hierarchical chapter structure
- Include ad placeholder insertion logic (every 2 blocks)
- Style with Noto Sans KR font and CSS variables for theming

Files:
- docs/index.html: Main viewer structure
- docs/css/style.css: Complete styling (sidebar, content blocks, navigation)
- docs/js/app.js: App logic (JSON loading, TOC generation, block rendering)
- docs/data/data.json: Sample tuning guide data (3 chapters)
```

---

## 1.2 JSON 스키마 설계

### 📍 관련 파일:
- [n8n/target_schema.json](n8n/target_schema.json)

### ✅ 완료 내용:

#### A. 스키마 구조 정의
- **metadata**: 문서 메타 정보
  - title, original_filename, processed_date, doc_type
- **chapters**: 챕터 배열
  - id, title, level (1=Chapter, 2=Section)
  - **content_blocks**: 콘텐츠 블록 배열
    - block_type: text, image, list, code, warning, tip, concept, example
    - content: 실제 내용 (string 또는 array)
    - attributes: 추가 속성 (url, caption, difficulty)

#### B. 난이도 태깅 시스템
- `difficulty` 속성: beginner, intermediate, advanced, common
- 향후 초/중/고급 전자책 분리에 활용 예정

#### C. JSON Schema (Draft-07) 형식
- 타입 검증 가능
- GitBook/WikiDocs API 호환 구조
- 재귀 구조 지원 (subsections)

### ✅ 기능 검증 완료:
- [x] 샘플 데이터 (data.json)가 스키마 구조와 일치
- [x] 웹앱에서 정상 렌더링

### 📦 PR Commit Message (예시):
```
feat: Define JSON schema for educational content structure

- Create JSON Schema (Draft-07) for tuning guide documents
- Define metadata structure (title, source, version, doc_type)
- Define hierarchical chapter structure with content blocks
- Support 8 block types: text, image, list, code, warning, tip, concept, example
- Add difficulty tagging system (beginner/intermediate/advanced)
- Compatible with GitBook/WikiDocs API structure

File: n8n/target_schema.json
```

---

## 1.3 AI 파싱 프롬프트 작성

### 📍 관련 파일:
- [n8n/parsing_prompt_system.md](n8n/parsing_prompt_system.md)

### ✅ 완료 내용:

#### A. System Instruction 정의
- Role: Expert Educational Content Structurer
- Objective: Parse raw text into structured JSON

#### B. 파싱 규칙 작성
1. **Structure & Hierarchy**: 제목 계층 구조 분석 (H1 → Chapter, H2 → Section)
2. **Block Classification**: 8가지 블록 타입 분류 기준
   - concept: 정의, 핵심 이론
   - text: 일반 설명
   - list: 목록
   - warning: 경고 사항
   - tip: 팁/힌트
   - example: 실습 예제
   - image: 이미지 위치/설명
3. **Difficulty Tagging**: 내용 복잡도 자동 판단

#### C. Output Format 명시
- 엄격한 JSON 출력 요구
- 마크다운 펜싱 없이 순수 JSON만 출력
- 예시 JSON 구조 포함

### ✅ 기능 검증 완료:
- [x] 프롬프트 문서 작성 완료
- [ ] 실제 AI 파싱 테스트는 미완료 (n8n 설정 필요)

### 📦 PR Commit Message (예시):
```
feat: Add AI parsing system prompt for content structuring

- Define role and objective for AI content parser
- Specify parsing rules for structure, hierarchy, and block classification
- Add 8 block type definitions with classification criteria
- Include difficulty tagging guidelines (beginner/intermediate/advanced)
- Provide strict JSON output format requirements
- Include example JSON structure

File: n8n/parsing_prompt_system.md
Purpose: Use as system instruction for n8n AI parser node (Gemini Pro / OpenAI)
```

---

## 1.4 프로젝트 문서화

### 📍 관련 파일:
- [COMPLETED_TASKS.md](COMPLETED_TASKS.md)

### ✅ 완료 내용:
- 전체 작업 내역 정리 (9개 섹션)
- 완료된 작업 상세 설명
- 원래 기획 vs 현재 구현 비교
- 미완료 작업 및 우선순위 정리
- 다음 단계 (Phase 1-4) 로드맵
- 기술 스택 정리
- 주요 파일 경로 참조
- 이슈 및 주의사항
- 성공 기준 정의

### 📦 PR Commit Message (예시):
```
docs: Add comprehensive project documentation

- Document all completed tasks with technical details
- Compare original plan vs current implementation
- List pending tasks with priorities
- Define 4-phase roadmap
- Include tech stack summary and file structure
- Add success criteria and known issues

File: COMPLETED_TASKS.md
```

---

# ⚠️ TASK 2: 테스트가 필요한 작업 (PR 보류)

## 2.1 n8n 워크플로우 설정

### 📍 관련 파일:
- [n8n/project_n8n_workflow.json](n8n/project_n8n_workflow.json)

### ⚠️ 현재 상태:

#### A. 설계 완료 (6개 노드 구성)
1. **On Google Drive File Created** - Trigger 노드
2. **Google Drive Download** - 파일 다운로드
3. **Extract Text from File** - 텍스트 추출
4. **AI Content Parser** - OpenAI/Gemini 파싱
5. **Save Parsed JSON** - 로컬 저장
6. **Commit to GitHub** - 자동 커밋

#### B. 미완료 사항
- [ ] **Credential 설정 안됨**
  - Google Drive OAuth2 (재인증 필요: "Unable to sign without access token")
  - OpenAI API Key (설정됨, 테스트 필요)
  - GitHub OAuth2 (미설정)
- [ ] **노드 파라미터 검증 안됨**
  - Google Drive Download: Operation이 "Upload"로 잘못 설정됨 → "Download"로 변경 필요
  - Extract Text: 텍스트 추출 방식 미검증
  - AI Parser: 실제 파싱 결과 미확인
- [ ] **End-to-End 테스트 안됨**
  - 전체 워크플로우 실행 안해봄
  - 파싱 품질 미검증

### 🔴 테스트 필요 항목:

#### Step 1: Credential 재설정
1. Google Drive OAuth2 재인증
   - Scope 확인: `drive`, `drive.file`
   - Test Connection 성공 확인
2. OpenAI API Key 검증
   - Model: `gpt-4o` 사용 가능 여부 확인
   - 또는 Gemini Pro로 변경
3. GitHub OAuth2 설정
   - Scope: `repo`, `workflow`

#### Step 2: 노드별 테스트
1. **Google Drive Trigger**
   - Mode: "File Updated" 선택
   - Trigger On: "Changes to a Specific Folder" 또는 "Specific File"
   - Watch For: "File Updated"
   - "Fetch Test Event" 실행 → 파일 정보 출력 확인
2. **Google Drive Download**
   - Operation: "Upload" → **"Download"**로 변경
   - File ID: `{{ $json.id }}` (이전 노드 연결)
   - "Execute Node" 실행 → 파일 다운로드 확인
3. **Extract Text from File**
   - Binary Data 입력 확인
   - PDF/DOCX 텍스트 추출 성공 여부
4. **AI Content Parser**
   - System Prompt: `parsing_prompt_system.md` 내용 입력
   - User Prompt: `{{ $json.text }}`
   - JSON Output 활성화
   - 실행 결과: 스키마 형식 일치 여부 확인
5. **Save Parsed JSON**
   - 파일 경로: `docs/data/data.json`
   - 저장 성공 확인
6. **Commit to GitHub**
   - Repository: `kati-korea/tuning-tutorial` (생성 필요)
   - File Path: `docs/data/data.json`
   - Commit Message 자동 생성

#### Step 3: End-to-End 테스트
1. Google Drive에 테스트 문서 업로드/수정
2. n8n 워크플로우 자동 실행 확인
3. 생성된 JSON 파일 품질 검증
4. GitHub 자동 커밋 확인

### 🚫 PR 보류 이유:
- 실제로 작동하지 않는 코드를 커밋하면 안됨
- Credential ID가 플레이스홀더(`YOUR_CREDENTIAL_ID`)로 되어 있음
- 노드 설정 오류 있음 (Upload vs Download)
- 테스트 없이 PR하면 나중에 디버깅 어려움

### 📝 테스트 완료 후 PR 방법:
```
feat: Add n8n automation workflow for document parsing

- Configure 6-node workflow: Drive Trigger → Download → Text Extract → AI Parse → Save → GitHub Commit
- Set up Google Drive OAuth2 for file monitoring
- Integrate OpenAI GPT-4o for content parsing (or Gemini Pro)
- Auto-commit parsed JSON to GitHub repository
- Tested end-to-end with sample tuning guide document

Workflow tested successfully:
- Google Drive file update detection: ✅
- PDF/DOCX text extraction: ✅
- AI parsing with schema validation: ✅
- JSON file generation: ✅
- GitHub auto-commit: ✅

File: n8n/project_n8n_workflow.json
```

---

## 2.2 GitHub 리포지토리 및 Pages 설정

### ⚠️ 현재 상태:

#### 미완료 사항:
- [ ] Git 초기화 안됨 (`.git` 폴더 없음)
- [ ] GitHub 리포지토리 생성 안됨 (`kati-korea/tuning-tutorial`)
- [ ] GitHub Pages 배포 설정 안됨
- [ ] 첫 커밋 안됨

### 🔴 테스트 필요 항목:

#### Step 1: Git 초기화
```bash
cd /Users/jay/.gemini/antigravity/scratch/tuning-tutorial
git init
git add .
git commit -m "Initial commit: Tuning guide prototype"
```

#### Step 2: GitHub 리포지토리 생성
1. GitHub에서 `kati-korea/tuning-tutorial` 생성
2. Remote 추가:
   ```bash
   git remote add origin https://github.com/kati-korea/tuning-tutorial.git
   git branch -M main
   git push -u origin main
   ```

#### Step 3: GitHub Pages 설정
1. Repository Settings → Pages
2. Source: `main` branch, `/docs` folder
3. 배포 URL 확인: `https://kati-korea.github.io/tuning-tutorial/`

#### Step 4: 웹앱 동작 확인
1. GitHub Pages URL 접속
2. 웹앱 정상 렌더링 확인
3. TOC 클릭, 네비게이션 동작 확인

### 📝 테스트 완료 후 작업:
- README.md 작성 (프로젝트 소개, 데모 링크, 설치 방법)
- GitHub Actions 워크플로우 추가 (자동 배포)

---

## 2.3 난이도별 전자책 분리

### ⚠️ 현재 상태:

#### 미완료 사항:
- [ ] 초급/중급/고급 필터링 없음
- [ ] 단일 `data.json` 파일만 존재
- [ ] UI에 난이도 탭/필터 없음

### 🔴 구현 필요 항목:

1. **데이터 분리 전략 결정**
   - 옵션 A: 3개 파일로 분리 (`beginner.json`, `intermediate.json`, `advanced.json`)
   - 옵션 B: 단일 JSON + 클라이언트 필터링
2. **UI 개선**
   - 난이도 탭 추가
   - 블록별 난이도 표시
3. **콘텐츠 재분류**
   - 기존 블록에 `difficulty` 속성 추가
   - AI 파싱 시 자동 난이도 태깅

---

## 2.4 원본 데이터 수집 및 변환

### ⚠️ 현재 상태:

#### 미완료 사항:
- [ ] 원본 HWP/PDF/DOCX 파일 다운로드 안됨
- [ ] Google Docs 변환 안됨
- [ ] 이미지 추출 안됨
- [ ] 여러 문서 파싱 안됨

### 🔴 테스트 필요 항목:

1. Google Drive "원본 데이터" 폴더 접근
2. 파일 다운로드 및 변환
3. n8n으로 여러 문서 일괄 파싱
4. 파싱 품질 검증

---

# 📋 PR 전략 제안

## PR #1: 정적 웹앱 프로토타입 (즉시 가능) ✅
**포함 파일:**
- `docs/index.html`
- `docs/css/style.css`
- `docs/js/app.js`
- `docs/data/data.json`
- `n8n/target_schema.json`
- `n8n/parsing_prompt_system.md`
- `COMPLETED_TASKS.md`

**PR 제목:**
```
feat: Add WikiDocs-style tuning guide web viewer prototype
```

**PR 설명:**
```
## Summary
튜닝 가이드 자동화 시스템의 정적 웹앱 프로토타입입니다.

## Features
- WikiDocs 스타일 2-column 레이아웃
- 동적 콘텐츠 렌더링 (JSON 기반)
- TOC 자동 생성 및 네비게이션
- 8가지 콘텐츠 블록 타입 지원
- 광고 영역 플레이스홀더
- JSON 스키마 정의
- AI 파싱 프롬프트 문서

## Demo
- 샘플 데이터: 데칼 커스텀 가이드 (3 챕터)
- 로컬 실행: `open docs/index.html`

## Next Steps
- [ ] n8n 워크플로우 테스트 및 통합
- [ ] GitHub Pages 배포
- [ ] 초/중/고급 난이도 분리
```

---

## PR #2: n8n 자동화 워크플로우 (테스트 후) ⚠️
**포함 파일:**
- `n8n/project_n8n_workflow.json` (수정 버전)

**전제 조건:**
- [ ] Credential 설정 완료
- [ ] 모든 노드 테스트 성공
- [ ] End-to-End 파싱 테스트 성공

---

## PR #3: GitHub Pages 배포 설정 (리포지토리 생성 후) ⚠️
**포함 파일:**
- `.github/workflows/deploy.yml` (GitHub Actions)
- `README.md`

---

# 🎯 추천 작업 순서

1. **PR #1 생성** (지금 바로 가능) ✅
   - 완료된 웹앱 프로토타입 커밋
   - 문서화 포함
2. **n8n 워크플로우 디버깅** (현재 진행 중)
   - Credential 재설정
   - 노드 수정 및 테스트
3. **PR #2 생성** (테스트 완료 후)
   - 작동하는 n8n 워크플로우 커밋
4. **GitHub 리포지토리 생성 및 배포**
   - Git 초기화
   - GitHub Pages 설정
5. **PR #3 생성** (배포 확인 후)
   - README 및 자동 배포 설정

---

**작성 완료**: 2025-12-08
