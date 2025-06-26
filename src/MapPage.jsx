import React from "react";
import Plot from "react-plotly.js";

function SimpleContourMap() {
  // x, y 軸（UMAPの代用）: 10×10 グリッド
  const x = Array.from({ length: 10 }, (_, i) => i);
  const y = Array.from({ length: 10 }, (_, j) => j);

  // z値：サンプルとして x*y のパターン（山形）
  const z = y.map((j) =>
    x.map((i) => Math.sin(i / 2) * Math.cos(j / 2))
  );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Plot
        data={[
          {
            x: x,
            y: y,
            z: z,
            type: "contour",
            colorscale: "YlOrRd",
            contours: {
              coloring: "heatmap", // 'lines' にすると線だけ表示
              showlines: true,
            },
            line: {
              width: 2,
              color: "black",
            },
            showscale: true,
          },
        ]}
        layout={{
          autosize: true,
          title: "Contour Map Demo",
          xaxis: { title: "X axis" },
          yaxis: { title: "Y axis" },
          margin: { t: 50, l: 50, r: 50, b: 50 },
        }}
        config={{ responsive: true }}
        useResizeHandler={true}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

export default SimpleContourMap;
