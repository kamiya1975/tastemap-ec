import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

function MapPage() {
  const [xVals, setXVals] = useState([]);
  const [yVals, setYVals] = useState([]);
  const [zMatrix, setZMatrix] = useState([]);
  const [selectedContour, setSelectedContour] = useState("甘味");

  useEffect(() => {
    fetch(`/wine_grid_${selectedContour}.json`)
      .then((res) => res.json())
      .then((json) => {
        setXVals(json.x);
        setYVals(json.y);
        setZMatrix(json.z);
      });
  }, [selectedContour]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div style={{ padding: "8px" }}>
        <label htmlFor="contour-select">等高線項目を選択: </label>
        <select
          id="contour-select"
          value={selectedContour}
          onChange={(e) => setSelectedContour(e.target.value)}
        >
          <option value="甘味">甘味</option>
          <option value="渋味">渋味</option>
          <option value="酸味">酸味</option>
        </select>
      </div>

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
                end: 1,
                size: 0.05,
              },
              opacity: 0.8,
              showscale: true,
              name: selectedContour,
            },
            {
              x: xVals,
              y: yVals,
              mode: 'markers',
              type: 'scatter',
              marker: {
                color: 'black',
                size: 4,
                opacity: 0.7,
              },
              name: "打点",
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
          style={{ width: "100%", height: "90%" }}
        />
      )}
    </div>
  );
}

export default MapPage;
