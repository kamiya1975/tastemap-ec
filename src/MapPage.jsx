import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import Papa from "papaparse";

function MapPage() {
  const [xVals, setXVals] = useState([]);
  const [yVals, setYVals] = useState([]);
  const [zMatrix, setZMatrix] = useState([]);
  const [minZ, setMinZ] = useState(0);
  const [maxZ, setMaxZ] = useState(1);

  useEffect(() => {
    fetch("/wine_grid_final_甘味.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            const rows = result.data.filter((r) => Object.keys(r).length > 0);

            const y = rows.map((row) => parseFloat(row["y"]));

            const xKeys = Object.keys(rows[0]).filter((k) => k.startsWith("x_"));
            const x = xKeys.map((k) => parseFloat(k.replace("x_", "")));

            const z = rows.map((row) =>
              xKeys.map((k) => parseFloat(row[k]))
            );

            // 最小・最大Z値
            const flatZ = z.flat();
            const min = Math.min(...flatZ);
            const max = Math.max(...flatZ);

            setXVals(x);
            setYVals(y);
            setZMatrix(z.reverse()); // 反転表示（必要に応じて）
            setMinZ(min);
            setMaxZ(max);

            console.log("x.length:", x.length);
            console.log("y.length:", y.length);
            console.log("z shape:", z.length, z[0]?.length);
            console.log("minZ:", min, "maxZ:", max);
          },
        });
      });
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {zMatrix.length > 0 && (
        <Plot
          data={[
            {
              x: xVals,
              y: yVals,
              z: zMatrix,
              type: "contour",
              colorscale: "YlOrRd",
              contours: {
                coloring: "lines", // ✅ 等高線を「線のみ」で表示
                showlines: true,
                start: minZ,
                end: maxZ,
                size: (maxZ - minZ) / 10,
              },
              opacity: 0.9,
              showscale: true,
              name: "Z_甘味",
            },
          ]}
          layout={{
            autosize: true,
            margin: { t: 40, l: 40, r: 40, b: 40 },
            xaxis: { title: "UMAP1" },
            yaxis: { title: "UMAP2" },
            dragmode: "pan",
          }}
          config={{ responsive: true }}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
}

export default MapPage;
