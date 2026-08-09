import React from "react";

export default function VbondTruck3D({ bannerText = "V-BOND", subText = "TILE ADHESIVES" }) {
  return (
    <div className="truck-stage-3d">
      <div className="truck-road">
        <div className="truck-road-dashes" />
      </div>

      <div className="vbond-truck-container">
        {/* Exhaust Smoke Animation */}
        <div className="truck-exhaust-smoke" />

        {/* Cargo Container Trailer */}
        <div className="truck-cargo-trailer">
          <div className="vbond-truck-banner">
            <span className="vbond-banner-title">{bannerText}</span>
            <span className="vbond-banner-sub">{subText}</span>
          </div>
        </div>

        {/* Truck Front Cabin */}
        <div className="truck-cabin">
          <div className="truck-windshield" />
          <div className="truck-headlight-beam" />
        </div>

        {/* 3D Wheels Row */}
        <div className="truck-wheel-row">
          <div className="truck-wheel-3d">
            <div className="truck-wheel-rim" />
          </div>
          <div className="truck-wheel-3d">
            <div className="truck-wheel-rim" />
          </div>
          <div className="truck-wheel-3d">
            <div className="truck-wheel-rim" />
          </div>
        </div>
      </div>
    </div>
  );
}
