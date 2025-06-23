import React, { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import './App.css';
import { Link } from 'react-router-dom';

function MapPage() {
  const [data, setData] = useState([]);
  const [slider_pc1, setSliderPc1] = useState(50);
  const [slider_pc2, setSliderPc2] = useState(50);
  const [xRange, setXRange] = useState([-10, 10]);
  const [yRange, setYRange] = useState([-10, 10]);

  // データ読み込み
  useEffect(() => {
    fetch('/data/wine_data.json')
      .then((res) => res.json())
      .then((json) => {
        setData(json);

        // x, y 軸の範囲を自動設定
        const xVals = json.map(d => parseFloat(d.BodyAxis));
        const yVals = json.map(d => parseFloat(d.SweetAxis));
        const xMin = Math.min(...xVals);
        const xMax = Math.max(...xVals);
        const yMin = Math.min(...yVals);
        const yMax = Math.max(...yVals);
        setXRange([xMin - 1, xMax + 1]);
        setYRange([yMin - 1, yMax + 1]);
      })
      .catch((err) => {
        console.error("JSON読み込みエラー:", err);
      });
  }, []);

  // スライダーに基づくターゲット点
  const target = useMemo(() => {
    const xMin = xRange[0], xMax = xRange[1];
    const yMin = yRange[0], yMax = yRange[1];
    return {
      x: xMin + (slider_pc1 / 100) * (xMax - xMin),
      y: yMin + (slider_pc2 / 100) * (yMax - yMin)
    };
  }, [slider_pc1, slider_pc2, xRange, yRange]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>ワインマップ（UMAP表示）</h2>

      {/* スライダー */}
      <div>
        <label>ボディ（BodyAxis）</label>
        <input type="range" min="0" max="100" value={slider_pc1}
          onChange={(e) => setSliderPc1(Number(e.target.value))} />
        <span>{slider_pc1}</span>
      </div>

      <div>
        <label>甘さ（SweetAxis）</label>
        <input type="range" min="0" max="100" value={slider_pc2}
          onChange={(e) => setSliderPc2(Number(e.target.value))} />
        <span>{slider_pc2}</span>
      </div>

      {/* 散布図 */}
      <Plot
        data={[
          // 全ワイン打点
          {
            x: data.map(d => parseFloat(d.BodyAxis)),
            y: data.map(d => parseFloat(d.SweetAxis)),
            text: data.map(d => d["商品名"]),
            mode: 'markers',
            type: 'scatter',
            marker: { size: 8, color: 'black', opacity: 0.6 },
            name: 'ワイン'
          },
          // ターゲット（赤）
          {
            x: [target.x],
            y: [target.y],
            text: ['あなたの好み'],
            mode: 'markers+text',
            type: 'scatter',
            marker: { size: 14, color: 'red' },
            textposition: 'top center',
            name: 'あなたの好み'
          }
        ]}
        layout={{
          width: 600,
          height: 600,
          title: 'UMAPワインマップ',
          xaxis: { range: xRange, title: 'ボディ' },
          yaxis: { range: yRange, title: '甘さ' },
          dragmode: 'pan',
        }}
        config={{ responsive: true, scrollZoom: true }}
      />

      <div style={{ marginTop: '20px' }}>
        <Link to="/">← トップへ戻る</Link>
      </div>
    </div>
  );
}

export default MapPage;
