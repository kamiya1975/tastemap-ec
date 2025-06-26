import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

function MapPage() {
  const [x, setX] = useState([]);
  const [y, setY] = useState([]);
  const [z, setZ] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/wine_grid_甘味.json')
      .then((res) => res.json())
      .then((data) => {
        const xData = data.x;
        const yData = data.y;
        const zData = data.z;

        // 数値型かどうかを保証（文字列なら parse）
        const parsedX = xData.map(Number);
        const parsedY = yData.map(Number);
        const parsedZ = zData.map(row => row.map(Number));

        setX(parsedX);
        setY(parsedY);
        setZ(parsedZ);
        setLoaded(true);
      });
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {loaded && (
        <Plot
          data={[
            {
              x: x,
              y: y,
              z: z,
              type: 'contour',
              colorscale: 'YlOrRd',
              contours: {
                coloring: 'heatmap',
                showlines: true
              },
              showscale: true,
              zmin: 0,         // 強制スケール調整（必要なら）
              zmax: 1.0
            }
          ]}
          layout={{
            title: '甘味 等高線マップ',
            autosize: true,
            margin: { t: 40, l: 40, r: 40, b: 40 },
            xaxis: { title: 'UMAP1' },
            yaxis: { title: 'UMAP2' },
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
