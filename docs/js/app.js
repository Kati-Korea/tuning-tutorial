// App Logic
let currentChapterIndex = 0;
let flatChapters = []; // To store flattened list of all chapters for easy navigation
let sampleJson = null; // Will be loaded from file

document.addEventListener('DOMContentLoaded', () => {
    // Fetch data from external JSON file (simulating Real-time update from GitHub)
    fetch('data/data.json')
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            initApp(data);
        })
        .catch(error => {
            console.error('Error loading book data:', error);
            // Fallback for testing if file missing
            document.getElementById('doc-title').textContent = "데이터 로딩 실패";
        });
});

function initApp(data) {
    // 1. Flatten the chapter structure for easy Prev/Next logic
    sampleJson = data;

    data.chapters.forEach(ch => {
        flatChapters.push(ch);
        if (ch.subsections) {
            flatChapters = flatChapters.concat(ch.subsections);
        }
    });

    renderCompleteDoc(data); // Initial Render (Sidebar & First Chapter)
    updateNavigationState();

    // Event Listeners
    document.getElementById('btn-prev').onclick = () => navigate(-1);
    document.getElementById('btn-next').onclick = () => navigate(1);
}

function navigate(direction) {
    const newIndex = currentChapterIndex + direction;
    if (newIndex >= 0 && newIndex < flatChapters.length) {
        currentChapterIndex = newIndex;
        renderContent(flatChapters[currentChapterIndex]);
        updateNavigationState();
        window.scrollTo(0, 0); // Scroll to top
    }
}

function updateNavigationState() {
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');

    // prevBtn might be null if not loaded yet? No, in DOMContentLoaded.
    if (prevBtn && nextBtn) {
        prevBtn.disabled = currentChapterIndex === 0;
        nextBtn.disabled = currentChapterIndex === flatChapters.length - 1;
    }

    // Update active state in sidebar
    document.querySelectorAll('.toc-item').forEach((el, idx) => {
        if (idx === currentChapterIndex) el.classList.add('active');
        else el.classList.remove('active');
    });
}

function renderCompleteDoc(data) {
    // Set Header Info
    document.getElementById('doc-title').textContent = data.metadata.title;
    document.getElementById('doc-meta').textContent = `버전: ${data.metadata.version}`;

    // Render TOC
    const tocContainer = document.getElementById('toc-nav');
    tocContainer.innerHTML = ''; // Clear

    flatChapters.forEach((ch, idx) => {
        const link = document.createElement('a');
        link.className = `toc-item ${ch.level > 1 ? 'toc-sub' : ''}`;
        link.textContent = ch.title;
        link.onclick = () => {
            currentChapterIndex = idx;
            renderContent(ch);
            updateNavigationState();
        };
        tocContainer.appendChild(link);
    });

    // Render First Chapter Initially
    renderContent(flatChapters[0]);
}

function renderContent(chapterData) {
    const container = document.getElementById('content-renderer');
    container.innerHTML = ''; // Clear previous content

    const section = document.createElement('section');
    section.className = 'doc-section';

    // Title
    const title = document.createElement('h2');
    title.textContent = chapterData.title;
    section.appendChild(title);

    // Blocks
    if (chapterData.content_blocks) {
        chapterData.content_blocks.forEach((block, index) => {
            // Insert Ad every 3 blocks (Example Logic)
            if (index > 0 && index % 2 === 0) {
                const ad = document.createElement('div');
                ad.className = 'ad-placeholder';
                ad.innerHTML = '<span>SPONSORED</span><strong>교육 파트너 광고 영역</strong>';
                section.appendChild(ad);
            }

            const blockEl = document.createElement('div');
            blockEl.className = `block block-${block.type} ${block.style || ''}`;

            if (block.type === 'text') {
                blockEl.innerHTML = `<p>${block.content}</p>`;
            } else if (block.type === 'image') {
                blockEl.innerHTML = `
                    <figure>
                        <img src="${block.url}" alt="${block.caption}">
                        <figcaption>${block.caption}</figcaption>
                    </figure>
                `;
            } else if (block.type === 'callout') {
                blockEl.innerHTML = `<strong>${block.style.toUpperCase()}:</strong> ${block.content}`;
            } else if (block.type === 'list') {
                const listTag = block.style === 'ordered' ? 'ol' : 'ul';
                const listItems = block.items.map(item => `<li>${item}</li>`).join('');
                blockEl.innerHTML = `<${listTag}>${listItems}</${listTag}>`;
            }

            section.appendChild(blockEl);
        });
    }

    container.appendChild(section);
}
