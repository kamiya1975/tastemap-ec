import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

function MapPage() {
  const [gridData, setGridData] = useState(null);
  const [selectedZ, setSelectedZ] = useState("Z_甘味");

  useEffect(() => {
    fetch("/wine_grid_all_with_scatter.json")
      .then((res) => res.json())
      .then((data) => setGridData(data));
  }, []);

  if (!gridData) return <div>Loading...</div>;

  const { x, y, z_all, scatterPoints } = gridData;
  const z = z_all[selectedZ];

  return (
    <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0, overflow: "hidden" }}>
      {/* ドロップダウン（上部固定） */}
      <div style={{
        position: "absolute",
        top: "5px",
        left: "5px",
        zIndex: 10,
        backgroundColor: "rgba(255,255,255,0.8)",
        borderRadius: "6px",
        padding: "4px 8px"
      }}>
        <label htmlFor="z-select" style={{ fontSize: "0.9rem", marginRight: "5px" }}>Z軸の種類:</label>
        <select
          id="z-select"
          value={selectedZ}
          onChange={(e) => setSelectedZ(e.target.value)}
          style={{ fontSize: "0.9rem" }}
        >
          {Object.keys(z_all).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>

      <Plot
        data={[
          {
            type: "contour",
            x: x,
            y: y,
            z: z,
            colorscale: "YlOrRd",
            contours: {
              coloring: "heatmap",
              showlines: true,
              start: 0,
              end: 1,
              size: 0.05,
            },
            opacity: 0.8,
            showscale: false, // ✅ カラーバーを非表示
            hoverinfo: "none",
          },
          {
            type: "scatter",
            mode: "markers",
            x: scatterPoints.map((p) => p.x),
            y: scatterPoints.map((p) => p.y),
            marker: {
              color: "black",
              size: 5,
              opacity: 0.5,
            },
            hoverinfo: "skip",
            showlegend: false,
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
          displayModeBar: false,       // ✅ ズーム/カメラなどUIを非表示
          scrollZoom: true,            // ✅ スクロールで拡大縮小
          responsive: true,
        }}
        useResizeHandler={true}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

export default MapPage;
