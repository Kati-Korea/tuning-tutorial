/**
 * n8n JSON 출력을 마크다운으로 변환
 */

export interface Section {
  type: 'heading' | 'paragraph' | 'list';
  level?: number;
  content?: string;
  items?: string[];
  style?: 'bullet' | 'numbered';
}

export function jsonToMarkdown(sections: Section[]): string {
  return sections.map(section => {
    switch (section.type) {
      case 'heading':
        const level = section.level || 1;
        const hashes = '#'.repeat(level);
        return `${hashes} ${section.content}\n`;

      case 'paragraph':
        return `${section.content}\n`;

      case 'list':
        if (!section.items) return '';
        const bullet = section.style === 'numbered' ? '1.' : '-';
        return section.items.map(item => `${bullet} ${item}`).join('\n') + '\n';

      default:
        return '';
    }
  }).join('\n');
}
