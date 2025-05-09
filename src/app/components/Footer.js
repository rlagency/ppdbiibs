// components/Footer.js
'use client';

export default function Footer() {
  return (
    <footer className="w-full bg-[#f9f9f9] text-center text-sm text-gray-500 py-8 px-4 mt-20 border-t border-gray-200" style={{marginTop:'50px', fontSize:'13px'}}>
      <div className="max-w-screen-lg mx-auto">
        <p className="tracking-wide text-[13px]">
          &copy; RLA IIBS {new Date().getFullYear()} &mdash; All rights reserved.
        </p>
      </div>
    </footer>
  );
}
