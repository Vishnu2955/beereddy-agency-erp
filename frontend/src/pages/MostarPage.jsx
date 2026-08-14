import React from "react";

export default function MostarPage() {
  return (
    <div className="w-full h-screen fixed inset-0 z-50 bg-[#0b1110] overflow-hidden">
      <iframe
        src="/mostar.html"
        title="Mostar city cinematic scroll story"
        className="w-full h-full border-0"
        style={{ width: "100vw", height: "100vh" }}
      />
    </div>
  );
}
