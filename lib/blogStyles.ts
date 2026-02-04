/**
 * Blog Article Styling Utilities
 * Provides responsive CSS wrapper for published blog articles
 * to ensure consistent styling on both mobile and desktop
 */

export function getResponsiveBlogCSS(): string {
    return `
        <style>
            .blog-article-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 3rem 2rem;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: #0d1117;
                color: #e6edf3;
                line-height: 1.8;
            }

            /* Headings */
            .blog-article-container h1 {
                font-size: 2.5rem;
                font-weight: 700;
                color: #ffffff;
                margin: 2rem 0 1.5rem;
                line-height: 1.2;
            }

            .blog-article-container h2 {
                font-size: 2rem;
                font-weight: 700;
                color: #ffffff;
                margin: 2.5rem 0 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid #30363d;
                line-height: 1.3;
            }

            .blog-article-container h3 {
                font-size: 1.5rem;
                font-weight: 600;
                color: #ffffff;
                margin: 2rem 0 1rem;
                line-height: 1.4;
            }

            .blog-article-container h4 {
                font-size: 1.25rem;
                font-weight: 600;
                color: #e6edf3;
                margin: 1.5rem 0 0.75rem;
            }

            /* Paragraphs */
            .blog-article-container p {
                font-size: 1.125rem;
                color: #c9d1d9;
                margin: 1rem 0;
                line-height: 1.8;
            }

            /* Links */
            .blog-article-container a {
                color: #2ecc71;
                text-decoration: none;
                transition: color 0.2s;
            }

            .blog-article-container a:hover {
                color: #27ae60;
                text-decoration: underline;
            }

            /* Lists */
            .blog-article-container ul,
            .blog-article-container ol {
                font-size: 1.125rem;
                color: #c9d1d9;
                margin: 1rem 0;
                padding-left: 2rem;
                line-height: 1.8;
            }

            .blog-article-container li {
                margin: 0.5rem 0;
            }

            .blog-article-container ul li {
                list-style-type: disc;
            }

            .blog-article-container ol li {
                list-style-type: decimal;
            }

            /* Strong/Bold */
            .blog-article-container strong {
                color: #ffffff;
                font-weight: 600;
            }

            /* Code */
            .blog-article-container code {
                background: #161b22;
                color: #f7931a;
                padding: 0.2rem 0.4rem;
                border-radius: 4px;
                font-size: 0.9em;
                font-family: 'Courier New', monospace;
            }

            .blog-article-container pre {
                background: #161b22;
                border: 1px solid #30363d;
                border-radius: 6px;
                padding: 1rem;
                overflow-x: auto;
                margin: 1.5rem 0;
            }

            .blog-article-container pre code {
                background: transparent;
                padding: 0;
                color: #e6edf3;
            }

            /* Blockquotes */
            .blog-article-container blockquote {
                border-left: 4px solid #f7931a;
                padding-left: 1rem;
                margin: 1.5rem 0;
                font-style: italic;
                color: #8b949e;
            }

            /* Images */
            .blog-article-container img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                margin: 1.5rem 0;
            }

            /* Tables */
            .blog-article-container table {
                width: 100%;
                border-collapse: collapse;
                margin: 1.5rem 0;
                font-size: 1rem;
            }

            .blog-article-container th,
            .blog-article-container td {
                border: 1px solid #30363d;
                padding: 0.75rem;
                text-align: left;
            }

            .blog-article-container th {
                background: #161b22;
                color: #ffffff;
                font-weight: 600;
            }

            /* Responsive Design - Mobile */
            @media (max-width: 768px) {
                .blog-article-container {
                    padding: 1.5rem 1rem;
                }

                .blog-article-container h1 {
                    font-size: 1.875rem;
                }

                .blog-article-container h2 {
                    font-size: 1.5rem;
                }

                .blog-article-container h3 {
                    font-size: 1.25rem;
                }

                .blog-article-container h4 {
                    font-size: 1.125rem;
                }

                .blog-article-container p,
                .blog-article-container ul,
                .blog-article-container ol {
                    font-size: 1rem;
                }

                .blog-article-container pre {
                    padding: 0.75rem;
                    font-size: 0.875rem;
                }

                .blog-article-container table {
                    font-size: 0.875rem;
                }
            }

            /* Extra small devices */
            @media (max-width: 480px) {
                .blog-article-container {
                    padding: 1rem 0.75rem;
                }

                .blog-article-container h1 {
                    font-size: 1.5rem;
                }

                .blog-article-container h2 {
                    font-size: 1.25rem;
                }
            }
        </style>
    `;
}

/**
 * Wraps HTML content with responsive styling
 * @param html - Raw HTML content from markdown parser
 * @returns HTML wrapped in styled container
 */
export function wrapWithResponsiveStyles(html: string): string {
    const css = getResponsiveBlogCSS();
    return `${css}<div class="blog-article-container">${html}</div>`;
}
