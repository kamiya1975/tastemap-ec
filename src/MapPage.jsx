import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

function MapPage() {
  const [xVals, setXVals] = useState([]);
  const [yVals, setYVals] = useState([]);
  const [zMatrix, setZMatrix] = useState([]);

  useEffect(() => {
    fetch("/wine_grid_final_甘味.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            const rows = result.data;

            // y軸は行の 'y' 値
            const y = rows.map((row) => row["y"]);

            // x軸はカラム名から取得（"x_..."）
            const xKeys = Object.keys(rows[0]).filter((k) => k.startsWith("x_"));
            const x = xKeys.map((k) => parseFloat(k.replace("x_", "")));

            // z行列（y行 × x列）
            const z = rows.map((row) => xKeys.map((k) => row[k]));

            setXVals(x);
            setYVals(y);
            setZMatrix(z);
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
                coloring: "heatmap",
                showlines: true,
                start: 0,
                end: 1.0,
                size: 0.05,
              },
              opacity: 0.8,
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
