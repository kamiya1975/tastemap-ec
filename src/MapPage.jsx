import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import wineGridData from "../public/wine_grid_甘味.json";
import Papa from "papaparse";

function MapPage() {
  const [scatterPoints, setScatterPoints] = useState([]);

  useEffect(() => {
    fetch("/wine_data.csv")
      .then((res) => res.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (result) => {
            const rows = result.data;
            const points = rows
              .filter((row) => !isNaN(row["UMAP1"]) && !isNaN(row["UMAP2"]))
              .map((row) => ({
                x: row["UMAP1"],
                y: row["UMAP2"],
              }));
            setScatterPoints(points);
          },
        });
      });
  }, []);

  const x = wineGridData["x"];
  const y = wineGridData["y"];
  const z = wineGridData["z"];

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
              coloring: "heatmap",
              showlines: true,
              start: 0,
              end: 1,
              size: 0.05,
            },
            opacity: 0.8,
            showscale: true,
            name: "Z_甘味",
          },
          {
            x: scatterPoints.map((d) => d.x),
            y: scatterPoints.map((d) => d.y),
            type: "scatter",
            mode: "markers",
            marker: { color: "black", size: 5, opacity: 0.8 },
            name: "ワイン打点",
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
    </div>
  );
}

export default MapPage;
