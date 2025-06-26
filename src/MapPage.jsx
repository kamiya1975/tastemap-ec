import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

function MapPage() {
  const [gridData, setGridData] = useState(null);
  const [selectedZ, setSelectedZ] = useState("Z_甘味");

  useEffect(() => {
    fetch("/wine_grid_all.json")
      .then((res) => res.json())
      .then((data) => setGridData(data));
  }, []);

  if (!gridData) return <div>Loading...</div>;

  const { x, y, z_all } = gridData;
  const z = z_all[selectedZ];

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {/* Z軸選択 */}
      <div style={{ padding: "10px" }}>
        <label htmlFor="z-select">Z軸の種類: </label>
        <select
          id="z-select"
          value={selectedZ}
          onChange={(e) => setSelectedZ(e.target.value)}
        >
          {Object.keys(z_all).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>

      {/* グラフ描画 */}
      <Plot
        data={[
          {
            type: "contour",
            x: x,          // xは100個の等間隔値
            y: y,          // yも同様
            z: z,          // zは [100][100] の2D配列
            colorscale: "YlOrRd",
            contours: {
              coloring: "heatmap",
              showlines: true,
              start: 0,
              end: 1,
              size: 0.05
            },
            opacity: 0.8,
            name: selectedZ,
            showscale: true
          }
        ]}
        layout={{
          autosize: true,
          margin: { t: 40, l: 40, r: 40, b: 40 },
          xaxis: { title: "UMAP1" },
          yaxis: { title: "UMAP2" },
          dragmode: "pan"
        }}
        config={{ responsive: true }}
        useResizeHandler={true}
        style={{ width: "100%", height: "90%" }}
      />
    </div>
  );
}

export default MapPage;
