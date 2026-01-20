import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchGemini } from './researchProviders';

// Define mocks *before* vi.mock if possible, but for hoisting we need to use a specific pattern or put it inside.
// However, since we need to control the behavior of the content generation, we'll implement a factory that uses a hoisted variable if possible, 
// OR simpler: just return the mock structure directly in the factory and spy on it later check return values or use `vi.hoisted`.

const mocks = vi.hoisted(() => {
    const mockGenerateContent = vi.fn();
    const mockGetGenerativeModel = vi.fn(() => ({
        generateContent: mockGenerateContent,
    }));

    // Use a real class or function that can be new-ed
    const MockGoogleGenerativeAI = class {
        constructor() { }
        getGenerativeModel = mockGetGenerativeModel;
    };

    return {
        MockGoogleGenerativeAI,
        mockGetGenerativeModel,
        mockGenerateContent
    }
});

vi.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: mocks.MockGoogleGenerativeAI,
}));

describe('researchProviders', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('searchGemini', () => {
        it('should return results when Gemini returns valid JSON', async () => {
            const mockResponse = {
                response: {
                    text: () => JSON.stringify({
                        results: [
                            { title: 'Test Title', url: 'http://test.com', content: 'Test Content' }
                        ]
                    })
                }
            };
            mocks.mockGenerateContent.mockResolvedValue(mockResponse);

            const result = await searchGemini('test query', 'fake-key');

            expect(result.provider).toBe('gemini');
            expect(result.results).toHaveLength(1);
            expect(result.results[0].title).toBe('Test Title');
            expect(mocks.mockGetGenerativeModel).toHaveBeenCalledWith(expect.objectContaining({
                tools: [{ googleSearchRetrieval: {} }]
            }));
        });

        it('should handle errors gracefully', async () => {
            mocks.mockGenerateContent.mockRejectedValue(new Error('API Error'));

            const result = await searchGemini('test query', 'fake-key');

            expect(result.provider).toBe('gemini');
            expect(result.results).toHaveLength(0);
            expect(result.error).toBe('API Error');
        });

        it('should clean markdown code blocks from response', async () => {
            const mockResponse = {
                response: {
                    text: () => "```json\n" + JSON.stringify({
                        results: [
                            { title: 'Cleaned', url: 'http://clean.com', content: 'Cleaned Content' }
                        ]
                    }) + "\n```"
                }
            };
            mocks.mockGenerateContent.mockResolvedValue(mockResponse);

            const result = await searchGemini('test query', 'fake-key');

            expect(result.results).toHaveLength(1);
            expect(result.results[0].title).toBe('Cleaned');
        });
    });
});
