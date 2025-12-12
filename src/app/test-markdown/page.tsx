import MarkdownRenderer from '@/components/MarkdownRenderer';
import { jsonToMarkdown, type Section } from '@/lib/json-to-markdown';

// n8n 출력 JSON (예시)
const n8nOutput = {
  "id": "beginner_exterior_데칼-튜닝-가이드",
  "parentId": "beginner_exterior",
  "level": 3,
  "title": "1) 데칼 튜닝 가이드",
  "slug": "데칼-튜닝-가이드",
  "type": "guide",
  "sections": [
    {
      "type": "heading" as const,
      "level": 1,
      "content": "1) 데칼 튜닝 가이드"
    },
    {
      "type": "paragraph" as const,
      "content": "데칼 튜닝은 차량 외부에 그래픽 디자인을 적용하여 개성을 표현하는 작업입니다. 데칼은 차량의 스타일을 변화시키고, 브랜드를 홍보하며, 차체를 보호하는 등 여러 목적으로 활용할 수 있는 효과적인 튜닝 방법입니다. 이 튜닝은 비교적 간단하고 비용이 저렴하며, 원상복구도 용이하여 많은 차주들이 선택하고 있습니다."
    },
    {
      "type": "heading" as const,
      "level": 2,
      "content": "1. 개요 및 주요 기능"
    },
    {
      "type": "paragraph" as const,
      "content": "데칼 튜닝은 차량의 외부에 그래픽 필름을 부착하여 다양한 색상과 무늬, 텍스트를 통해 스타일을 변화시키는 작업입니다. 이 튜닝을 통해 차주의 개성을 표현하고 차량을 독특하게 꾸밀 수 있습니다. 또한 기업이나 브랜드의 로고와 메시지를 부착하여 광고 효과를 얻을 수도 있으며, 차량 표면을 보호하는 역할도 합니다. 비용 부담이 적고 시공이 쉬워서 많은 사람들이 즐겨 사용하는 튜닝 방법 중 하나입니다."
    },
    {
      "type": "heading" as const,
      "level": 2,
      "content": "2. 데칼 튜닝의 필요성"
    },
    {
      "type": "paragraph" as const,
      "content": "데칼 튜닝은 다음과 같은 이유로 필요합니다:"
    },
    {
      "type": "list" as const,
      "style": "bullet" as const,
      "items": [
        "개성 표현: 데칼을 사용하면 차주가 원하는 스타일로 자동차 외관을 꾸밀 수 있습니다.",
        "브랜드 홍보: 기업 차량의 경우 로고와 메시지를 부착하면 이동하는 동안 자연스럽게 브랜드 홍보 효과를 얻을 수 있습니다.",
        "차체 보호: 자외선, 작은 긁힘, 돌 튀김 등으로부터 차량 페인트를 보호합니다."
      ]
    },
    {
      "type": "heading" as const,
      "level": 2,
      "content": "3. 역할과 장점"
    },
    {
      "type": "list" as const,
      "style": "bullet" as const,
      "items": [
        "개성 표현 및 브랜드 홍보",
        "차체 보호",
        "저렴한 비용",
        "원상복구 용이"
      ]
    }
  ] as Section[]
};

export default function TestMarkdownPage() {
    // JSON → 마크다운 변환
    const markdown = jsonToMarkdown(n8nOutput.sections);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">n8n JSON → Remark 렌더링 테스트</h1>
                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">
                        <strong>Document ID:</strong> {n8nOutput.id}
                    </p>
                    <p className="text-sm text-gray-600">
                        <strong>Sections:</strong> {n8nOutput.sections.length}개
                    </p>
                </div>
            </div>

            <div className="border-t pt-8">
                <MarkdownRenderer content={markdown} />
            </div>

            <details className="mt-8 p-4 bg-gray-50 rounded">
                <summary className="cursor-pointer font-bold">원본 마크다운 보기</summary>
                <pre className="mt-4 p-4 bg-white rounded overflow-x-auto text-sm">
                    {markdown}
                </pre>
            </details>
        </div>
    );
}
