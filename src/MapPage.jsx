import React, { useEffect, useState, useMemo } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';

function MapPage() {
  const [data, setData] = useState([]);
  const [slider_pc1, setSliderPc1] = useState(50);
  const [slider_pc2, setSliderPc2] = useState(50);
  const [x_min, setXmin] = useState(0);
  const [x_max, setXmax] = useState(100);
  const [y_min, setYmin] = useState(0);
  const [y_max, setYmax] = useState(100);

  // データ読み込み
  useEffect(() => {
    Papa.parse('/Merged_TasteDataDB15.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        const parsed = result.data.filter((row) => row.BodyAxis !== undefined && row.SweetAxis !== undefined);
        setData(parsed);

        // スライダーのスケールに使用
        const xVals = parsed.map(d => d.BodyAxis);
        const yVals = parsed.map(d => d.SweetAxis);
        setXmin(Math.min(...xVals));
        setXmax(Math.max(...xVals));
        setYmin(Math.min(...yVals));
        setYmax(Math.max(...yVals));
      }
    });
  }, []);

  // スライダー位置を x,y にマッピング
  const target = useMemo(() => ({
    x: x_min + (slider_pc1 / 100) * (x_max - x_min),
    y: y_min + (slider_pc2 / 100) * (y_max - y_min),
  }), [slider_pc1, slider_pc2, x_min, x_max, y_min, y_max]);

  // 距離計算して近いワインTOP10抽出
  const top10 = useMemo(() => {
    if (data.length === 0) return [];
    const distances = data.map((d) => {
      const dx = d.BodyAxis - target.x;
      const dy = d.SweetAxis - target.y;
      return { ...d, dist: Math.sqrt(dx * dx + dy * dy) };
    });
    return distances.sort((a, b) => a.dist - b.dist).slice(0, 10);
  }, [data, target]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>あなたの好みに寄り添うワイン</h2>

      {/* スライダー */}
      <div>
        <label>ボディ感</label>
        <input
          type="range"
          min={0}
          max={100}
          value={slider_pc1}
          onChange={(e) => setSliderPc1(Number(e.target.value))}
        />
        <span>{slider_pc1}</span>
      </div>
      <div>
        <label>甘み</label>
        <input
          type="range"
          min={0}
          max={100}
          value={slider_pc2}
          onChange={(e) => setSliderPc2(Number(e.target.value))}
        />
        <span>{slider_pc2}</span>
      </div>

      {/* 散布図 */}
      <Plot
        data={[
          {
            x: data.map(d => d.BodyAxis),
            y: data.map(d => d.SweetAxis),
            mode: 'markers',
            type: 'scatter',
            marker: { size: 6 },
            name: 'ワイン群',
          },
          {
            x: [target.x],
            y: [target.y],
            mode: 'markers+text',
            type: 'scatter',
            marker: { color: 'red', size: 14 },
            text: ['あなたの好み'],
            textposition: 'top center',
            name: '現在の選好',
          },
        ]}
        layout={{
          width: 700,
          height: 500,
          title: 'ワインの位置マップ',
          xaxis: { title: 'ボディ軸' },
          yaxis: { title: '甘さ軸' },
        }}
      />

      {/* 一覧表示 */}
      <h3>近いワインTOP10</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>#</th>
            <th>商品名</th>
            <th>ボディ</th>
            <th>甘み</th>
          </tr>
        </thead>
        <tbody>
          {top10.map((wine, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{wine['商品名']}</td>
              <td>{wine.BodyAxis}</td>
              <td>{wine.SweetAxis}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MapPage;
