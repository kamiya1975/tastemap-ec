import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import wineGridData from "../public/wine_grid_all_with_scatter.json";

function MapPage() {
  const [selectedZ, setSelectedZ] = useState("Z_甘味");

  // 🔧 gestureイベント防止（iOSでのピンチガクガク対策）
  useEffect(() => {
    const preventZoom = (e) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener("touchmove", preventZoom, { passive: false });
    return () => {
      document.removeEventListener("touchmove", preventZoom);
    };
  }, []);

  // 🔧 Z軸選択肢
  const zOptions = Object.keys(wineGridData.z_all || {});

  const z = wineGridData.z_all[selectedZ];
  const x = wineGridData.x;
  const y = wineGridData.y;

  const scatterX = wineGridData.scatter?.x || [];
  const scatterY = wineGridData.scatter?.y || [];

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
        <label>Z軸の種類：</label>
        <select value={selectedZ} onChange={(e) => setSelectedZ(e.target.value)}>
          {zOptions.map((zName) => (
            <option key={zName} value={zName}>{zName}</option>
          ))}
        </select>
      </div>

      <Plot
        data={[
          {
            x: x,
            y: y,
            z: z,
            type: "contour",
            colorscale: "YlOrRd",
            contours: {
              coloring: "heatmap",
              showlines: true,
              start: 0,
              end: 1,
              size: 0.05,
            },
            opacity: 0.9,
            showscale: true,
            name: selectedZ,
          },
          {
            x: scatterX,
            y: scatterY,
            type: "scatter",
            mode: "markers",
            marker: {
              color: "black",
              size: 5,
              opacity: 0.7,
            },
            name: "打点",
          },
        ]}
        layout={{
          autosize: true,
          margin: { t: 0, l: 0, r: 0, b: 0 },
          xaxis: { visible: false },
          yaxis: { visible: false },
          dragmode: "pan",
        }}
        config={{
          responsive: true,
          scrollZoom: true,
          displayModeBar: false,
          doubleClick: false,
        }}
        style={{ width: "100%", height: "100%", touchAction: "none" }}
        useResizeHandler={true}
      />
    </div>
  );
}

export default MapPage;
