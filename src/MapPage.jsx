import React, { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { Link } from 'react-router-dom';
import './App.css';

function MapPage() {
  const [data, setData] = useState([]);
  const [slider_pc1, setSliderPc1] = useState(50);
  const [slider_pc2, setSliderPc2] = useState(50);
  const [userRatings, setUserRatings] = useState({});
  const [zoomLevel, setZoomLevel] = useState(() => parseFloat(localStorage.getItem('zoomLevel')) || 2.0);

  // 散布図軸範囲を保持するstate
  const [xRange, setXRange] = useState([-7.5, 12.5]);
  const [yRange, setYRange] = useState([-7.5, 12.5]);

  // ✅ 初期ロード時にデータ読み込み
  useEffect(() => {
    fetch('/data/wine_data.json')
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  // ✅ 保存された評価を読み込み
  useEffect(() => {
    const storedRatings = localStorage.getItem('userRatings');
    if (storedRatings) {
      setUserRatings(JSON.parse(storedRatings));
    }
  }, []);

  // ✅ スライダー位置に対応する打点座標
  const x_min = xRange[0];
  const x_max = xRange[1];
  const y_min = yRange[0];
  const y_max = yRange[1];

  const target = useMemo(() => ({
    x: x_min + (slider_pc1 / 100) * (x_max - x_min),
    y: y_min + (slider_pc2 / 100) * (y_max - y_min),
  }), [slider_pc1, slider_pc2, x_min, x_max, y_min, y_max]);

  return (
    <div className="map-container">
      <h2 className="title">あなたの好みに寄り添うワイン</h2>

      <div className="sliders">
        <label>ボディ（軽い〜重い）</label>
        <input type="range" min="0" max="100" value={slider_pc1} onChange={(e) => setSliderPc1(Number(e.target.value))} />
        <label>甘さ（辛口〜甘口）</label>
        <input type="range" min="0" max="100" value={slider_pc2} onChange={(e) => setSliderPc2(Number(e.target.value))} />
      </div>

      <Plot
        data={[
          {
            x: data.map(d => d.BodyAxis),
            y: data.map(d => d.SweetAxis),
            text: data.map((d, i) => `❶➋➌➍➎➏➐➑➒❿`[i] || ""),
            mode: 'markers+text',
            type: 'scatter',
            marker: { size: 10, opacity: 0.6 },
            textposition: 'top center',
            name: '近いワイン',
          },
          {
            x: [target.x],
            y: [target.y],
            type: 'scatter',
            mode: 'markers',
            marker: { size: 15, color: 'red' },
            name: 'あなたの好み',
          },
        ]}
        layout={{
          width: 600,
          height: 600,
          margin: { t: 20, l: 20, r: 20, b: 20 },
          xaxis: { range: xRange, title: 'ボディ' },
          yaxis: { range: yRange, title: '甘さ' },
          dragmode: 'pan',
        }}
        config={{ responsive: true, scrollZoom: true }}
      />

      <div className="nav-link">
        <Link to="/">← 戻る</Link>
      </div>
    </div>
  );
}

export default MapPage;
