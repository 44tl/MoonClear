(() => {
    const searchInput = document.getElementById('main-search') as HTMLInputElement | null;
    const searchClear = document.getElementById('search-clear') as HTMLButtonElement | null;
    const cards = document.querySelectorAll<HTMLElement>('.card');
    const sections = document.querySelectorAll<HTMLElement>('.section-title');
    const backToTop = document.getElementById('back-to-top') as HTMLButtonElement | null;
    const siteCountEl = document.getElementById('site-count') as HTMLElement | null;
    const filterChips = document.querySelectorAll<HTMLAnchorElement>('.filter-chip');

    if (siteCountEl) {
        siteCountEl.textContent = `${cards.length} SITES`;
    }

    cards.forEach((card: HTMLElement) => {
        const urlEl = card.querySelector<HTMLAnchorElement>('.url');
        const visitBtn = card.querySelector<HTMLAnchorElement>('.visit-btn');
        if (urlEl && visitBtn && !card.querySelector('.card-buttons')) {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.type = 'button';
            copyBtn.innerHTML = `
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>COPY</span>
            `;
            copyBtn.addEventListener('click', (e: MouseEvent) => {
                e.preventDefault();
                const url = urlEl.textContent?.trim() || '';
                const fullUrl = urlEl.getAttribute('href') || (`https://${url}`);
                navigator.clipboard.writeText(fullUrl).then(() => {
                    const span = copyBtn.querySelector('span');
                    if (span) span.textContent = 'COPIED!';
                    copyBtn.classList.add('copied');
                    setTimeout(() => {
                        if (span) span.textContent = 'COPY';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                }).catch(() => {
                    const span = copyBtn.querySelector('span');
                    if (span) span.textContent = 'FAILED';
                    setTimeout(() => {
                        if (span) span.textContent = 'COPY';
                    }, 2000);
                });
            });

            visitBtn.innerHTML = `
                <span>VISIT</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
            `;

            const wrapper = document.createElement('div');
            wrapper.className = 'card-buttons';
            if (visitBtn.parentNode) {
                visitBtn.parentNode.insertBefore(wrapper, visitBtn.nextSibling);
            }
            wrapper.appendChild(visitBtn);
            wrapper.appendChild(copyBtn);
        }
    });

    const normalizeText = (text: string): string => {
        return text.toLowerCase().replace(/[^a-z0-9]/g, '');
    };

    const highlightText = (text: string, query: string): string => {
        if (!query) return text;
        const regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    };

    const escapeHtml = (str: string): string => {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    const performSearch = (): void => {
        if (!searchInput) return;
        const query = searchInput.value.trim();
        let visibleCount = 0;

        if (searchClear) {
            if (query) {
                searchClear.classList.add('active');
            } else {
                searchClear.classList.remove('active');
            }
        }

        cards.forEach((card: HTMLElement) => {
            const titleEl = card.querySelector<HTMLElement>('h3');
            const descEl = card.querySelector<HTMLElement>('p');
            const catEl = card.querySelector<HTMLElement>('.category-tag');
            const urlEl = card.querySelector<HTMLElement>('.url');

            const title = titleEl?.getAttribute('data-original') || titleEl?.textContent || '';
            const description = descEl?.getAttribute('data-original') || descEl?.textContent || '';
            const category = catEl?.getAttribute('data-original') || catEl?.textContent || '';
            const url = urlEl?.getAttribute('data-original') || urlEl?.textContent || '';

            if (titleEl && !titleEl.getAttribute('data-original')) titleEl.setAttribute('data-original', title);
            if (descEl && !descEl.getAttribute('data-original')) descEl.setAttribute('data-original', description);
            if (catEl && !catEl.getAttribute('data-original')) catEl.setAttribute('data-original', category);
            if (urlEl && !urlEl.getAttribute('data-original')) urlEl.setAttribute('data-original', url);

            const origTitle = titleEl?.getAttribute('data-original') || '';
            const origDesc = descEl?.getAttribute('data-original') || '';
            const origCat = catEl?.getAttribute('data-original') || '';
            const origUrl = urlEl?.getAttribute('data-original') || '';

            const searchText = normalizeText(`${origTitle} ${origDesc} ${origCat} ${origUrl}`);
            const normalizedQuery = normalizeText(query);

            if (normalizedQuery === '' || searchText.includes(normalizedQuery)) {
                card.style.display = '';
                visibleCount++;
                if (query) {
                    if (titleEl) titleEl.innerHTML = highlightText(origTitle, query);
                    if (descEl) descEl.innerHTML = highlightText(origDesc, query);
                    if (catEl) catEl.innerHTML = highlightText(origCat, query);
                    if (urlEl) urlEl.innerHTML = highlightText(origUrl, query);
                } else {
                    if (titleEl) titleEl.textContent = origTitle;
                    if (descEl) descEl.textContent = origDesc;
                    if (catEl) catEl.textContent = origCat;
                    if (urlEl) urlEl.textContent = origUrl;
                }
            } else {
                card.style.display = 'none';
            }
        });

        sections.forEach((section: HTMLElement) => {
            const grid = section.nextElementSibling as HTMLElement | null;
            if (grid && grid.classList.contains('grid')) {
                const hasVisibleCards = Array.from(grid.querySelectorAll<HTMLElement>('.card')).some(c => c.style.display !== 'none');
                section.style.display = hasVisibleCards ? '' : 'none';
                grid.style.display = hasVisibleCards ? '' : 'none';
            }
        });

        const existingNoResults = document.querySelector<HTMLElement>('.no-results');
        if (query && visibleCount === 0) {
            if (!existingNoResults) {
                const noResults = document.createElement('div');
                noResults.className = 'no-results';
                noResults.innerHTML = `
                    <h4>NO MATCHES FOUND</h4>
                    <p>No results found for "<strong>${escapeHtml(query)}</strong>". Try checking spelling or using a broader term.</p>
                `;
                const content = document.querySelector<HTMLElement>('.content');
                if (content) {
                    content.insertBefore(noResults, content.firstChild);
                }
            }
        } else if (existingNoResults) {
            existingNoResults.remove();
        }
    };

    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
    }

    if (searchClear && searchInput) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.focus();
            performSearch();
        });
    }

    document.addEventListener('keydown', (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        if (e.key === '/' && document.activeElement !== searchInput && (document.activeElement as HTMLElement)?.tagName !== 'INPUT') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        if (e.key === 'Escape' && document.activeElement === searchInput) {
            if (searchInput) {
                searchInput.value = '';
                performSearch();
                searchInput.blur();
            }
        }
    });

    window.addEventListener('scroll', () => {
        if (backToTop) {
            if (window.scrollY > 400) {
                backToTop.style.display = 'block';
            } else {
                backToTop.style.display = 'none';
            }
        }

        let currentSection = '';
        sections.forEach((section: HTMLElement) => {
            const top = section.getBoundingClientRect().top;
            if (top <= 160 && top >= -section.offsetHeight) {
                currentSection = '#' + section.id;
            }
        });

        filterChips.forEach((chip: HTMLAnchorElement) => {
            if (chip.getAttribute('href') === currentSection) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });
    }, { passive: true });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const initFlickeringGrid = (): void => {
        const canvas = document.getElementById('flickering-grid') as HTMLCanvasElement | null;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        const squareSize = 4;
        const gridGap = 6;
        const flickerChance = 0.05;
        const color = 'rgba(255, 255, 255, ';
        const maxOpacity = 0.18;
        const updateInterval = 80;

        let width = 0;
        let height = 0;
        let cols = 0;
        let rows = 0;
        let squares: Float32Array;
        let animationFrameId: number;
        let lastTime = 0;

        const setupGrid = () => {
            const dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            ctx.scale(dpr, dpr);

            cols = Math.floor(width / (squareSize + gridGap));
            rows = Math.floor(height / (squareSize + gridGap));
            squares = new Float32Array(cols * rows);

            for (let i = 0; i < squares.length; i++) {
                squares[i] = Math.random() * maxOpacity;
            }
        };

        const render = (time: number) => {
            if (time - lastTime >= updateInterval) {
                lastTime = time;
                ctx.clearRect(0, 0, width, height);

                for (let c = 0; c < cols; c++) {
                    for (let r = 0; r < rows; r++) {
                        const idx = c * rows + r;
                        if (Math.random() < flickerChance) {
                            squares[idx] = Math.random() * maxOpacity;
                        }

                        const opacity = squares[idx];
                        if (opacity > 0.005) {
                            ctx.fillStyle = `${color}${opacity})`;
                            ctx.fillRect(
                                c * (squareSize + gridGap),
                                r * (squareSize + gridGap),
                                squareSize,
                                squareSize
                            );
                        }
                    }
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        setupGrid();
        animationFrameId = requestAnimationFrame(render);

        let resizeTimeout: number;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = window.setTimeout(() => {
                cancelAnimationFrame(animationFrameId);
                setupGrid();
                lastTime = 0;
                animationFrameId = requestAnimationFrame(render);
            }, 100);
        });
    };

    initFlickeringGrid();
})();
