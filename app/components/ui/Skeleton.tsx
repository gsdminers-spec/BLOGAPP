
export function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />;
}

export function CardSkeleton() {
    return (
        <div className="card h-40">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <div className="flex gap-4 p-4 border-b">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-16 ml-auto" />
        </div>
    );
}
