import { ReactNode } from 'react';

export default function AuthPagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row h-full items-center">
      <div
        className="
          bg-[url('/public/assets/create-account-page/create-account-banner.svg')]
          bg-no-repeat
          bg-center
          bg-cover
          h-full
          md:w-[50%]
        "
      />
      <div className="md:flex-1">{children}</div>
    </div>
  );
}
