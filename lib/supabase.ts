
import { createClient } from '@supabase/supabase-js';

// Environment variable validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('FATAL: Supabase URL or Anon Key is missing from environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Type Definitions (Matches Database Schema) ---

export interface Phase {
  id: string; // UUID
  name: string;
  description?: string;
  order: number;
  article_count: number;
  created_at?: string;
}

export interface Category {
  id: string; // UUID
  phase_id: string;
  name: string;
  article_count: number;
  created_at?: string;
}

export interface Subcategory {
  id: string; // UUID
  category_id: string;
  name: string;
  article_count: number;
  created_at?: string;
}

export interface Topic {
  id: string; // UUID
  subcategory_id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'done';
  research_data?: any; // JSONB
  created_at?: string;
}

export interface Article {
  id: string; // UUID
  topic_id?: string;
  title: string;
  content: string;
  category?: string;
  status: 'draft' | 'ready' | 'scheduled' | 'published';
  created_at?: string;
  publish_date?: string;
}

export interface Keyword {
  id: string; // UUID
  phrase: string;
  model?: string;
  category?: string;
  intent_indicators?: any; // JSONB
  volume: 'low' | 'medium' | 'high';
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

export interface PublishItem {
  id: string;
  article_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'scheduled' | 'published' | 'cancelled';
  articles?: Article; // Join result
}

// --- Dashboard Stats Helper ---

export async function getDashboardStats() {
  try {
    const [articlesRes, topicsRes, publishedRes] = await Promise.all([
      supabase.from('articles').select('id', { count: 'exact', head: true }),
      supabase.from('topics').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    ]);

    return {
      articlesCreated: articlesRes.count || 0,
      pendingTopics: topicsRes.count || 0,
      readyToPublish: (articlesRes.count || 0) - (publishedRes.count || 0),
      published: publishedRes.count || 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      articlesCreated: 0,
      pendingTopics: 0,
      readyToPublish: 0,
      published: 0,
    };
  }
}
