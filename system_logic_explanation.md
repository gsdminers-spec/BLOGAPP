# System Architecture: How It Works

This document explains the data flow between your Admin App, Supabase Database, and the Public Website.

## The Core Concept

Your system acts like a **publisher**.
1.  **Admin App:** The "Newsroom" where you write and edit.
2.  **Supabase:** The "Printing Press" (Database) that stores everything.
3.  **Website:** The "Newspaper Stand" that shows the finished product to the world.

## Visual Data Flow

```mermaid
graph TD
    subgraph "Your Laptop / Admin Area"
        AdminApp[Admin App (Next.js)]
        User[You (The User)]
        User -->|Writes Article| AdminApp
    end

    subgraph "Supabase Database ( The Bridge )"
        direction TB
        PrivateTable[("articles table\n(Private Drafts)")]
        PublicTable[("blog_articles table\n(Public Live Content)")]
        
        AdminApp -->|1. Save Draft| PrivateTable
        AdminApp -->|2. Publish (Sync)| PublicTable
        
        note1[The 'Sync' happens when you click Publish.\nIt copies data from Private to Public.]
        PrivateTable -.-> note1 -.-> PublicTable
    end

    subgraph "The World Wide Web"
        Website[Public Website (Blog Section)]
        Visitors[Internet Visitors]
        
        Website -->|Reads Data| PublicTable
        Visitors -->|View| Website
    end

    style AdminApp fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    style PublicTable fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style Website fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
```

## Step-by-Step Logic

1.  **Creation:** You create an article in the **Admin App**. It is saved to the `articles` table in Supabase. This is your "Work In Progress" folder. The public cannot see this.
2.  **Publishing:** When you click **"Publish"**:
    *   The Admin App sends a command to the API.
    *   The API takes your finished article from the private `articles` table.
    *   It **copies** that article into the `blog_articles` table.
3.  **Display:** Your **Public Website** is connected *only* to the `blog_articles` table. When a user visits your blog, the website asks Supabase: *"Hey, give me the list of items in `blog_articles`."*

## Why this setup?
*   **Security:** You can write messy drafts without breaking the live site.
*   **Control:** You can unpublish or edit privately before "going live" again.

---
*Last Updated: Deployment Trigger Test*
