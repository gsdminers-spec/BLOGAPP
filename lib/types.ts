
export interface SearchResult {
    title: string;
    url: string;
    content: string;
    source?: string;
}

export interface PromptData {
    topic: string;
    results?: SearchResult[];
    aiSummary?: string;
}
