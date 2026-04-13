/**
 * 인증 라우트 그룹 로딩 UI
 */
export default function AuthLoading() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-gray-500">로딩 중...</p>
      </div>
    </div>
  );
}
