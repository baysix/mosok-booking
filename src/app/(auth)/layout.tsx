import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <div className="p-4">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    홈으로
                </Link>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
                {children}
            </div>
        </div>
    );
}
