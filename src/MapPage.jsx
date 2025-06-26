import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

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
            const rows = result.data;

            // ✅ xカラムを数値昇順でソート
            const xKeysSorted = Object.keys(rows[0])
              .filter((k) => k.startsWith("x_"))
              .sort((a, b) => {
                return parseFloat(a.replace("x_", "")) - parseFloat(b.replace("x_", ""));
              });

            const x = xKeysSorted.map((k) => parseFloat(k.replace("x_", "")));
            const y = rows.map((row) => row["y"]);
            const z = rows.map((row) => xKeysSorted.map((k) => row[k]));

            const flatZ = z.flat();
            const zMin = Math.min(...flatZ);
            const zMax = Math.max(...flatZ);

            setXVals(x);
            setYVals(y);
            setZMatrix(z);
            setMinZ(zMin);
            setMaxZ(zMax);
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
                start: minZ,
                end: maxZ,
                size: (maxZ - minZ) / 10 || 0.01,
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
