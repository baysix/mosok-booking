import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href={ROUTES.HOME}>
              <span className="text-xl font-extrabold text-primary">무속 예약</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              신뢰할 수 있는
              <br />
              무속인 예약 플랫폼
            </p>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">고객센터</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  자주 묻는 질문
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  공지사항
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  문의하기
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4">약관</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  이용약관
                </a>
              </li>
              <li>
                <a href="#" className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                  개인정보처리방침
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} 무속 예약. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
