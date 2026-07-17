import React, { useState } from 'react';

export default function PnLChart({ trades = [], activities = [], mode = 'futures' }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const isFuturesMode = mode === 'futures';
  const isWeb3Mode = mode === 'web3';
  const isCombinedMode = mode === 'combined';

  // 1. Filter and prepare items based on the active mode
  let items = [];
  if (isFuturesMode) {
    items = trades
      .filter(t => t.outcome === 'Take Profit' || t.outcome === 'Stop Loss')
      .map(t => ({
        name: t.token_name,
        pnl: Number(t.pnl),
        date: new Date(t.date_closed),
        prefix: 'Futures'
      }));
  } else if (isWeb3Mode) {
    items = activities
      .map(a => ({
        name: a.activity_name,
        pnl: Number(a.pnl),
        date: new Date(a.activity_date),
        prefix: 'Web3'
      }));
  } else {
    // Combined mode: merge trades and activities
    items = [
      ...trades
        .filter(t => t.outcome === 'Take Profit' || t.outcome === 'Stop Loss')
        .map(t => ({
          name: t.token_name,
          pnl: Number(t.pnl),
          date: new Date(t.date_closed),
          prefix: 'Futures'
        })),
      ...activities
        .map(a => ({
          name: a.activity_name,
          pnl: Number(a.pnl),
          date: new Date(a.activity_date),
          prefix: 'Web3'
        }))
    ];
  }

  // Sort chronologically
  items.sort((a, b) => a.date - b.date);

  if (items.length === 0) {
    return (
      <div className="glass-card p-6 h-40 flex items-center justify-center text-slate-500 text-xs">
        No performance history available. Add trades or activities to view PnL trend.
      </div>
    );
  }

  // 2. Establish chronological time bounds
  const dates = items.map(item => item.date);
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  
  // Shift start slightly back for aesthetic padding
  const startTimestamp = minDate.getTime() - 12 * 60 * 60 * 1000; 
  const endTimestamp = maxDate.getTime();
  const timeRange = endTimestamp - startTimestamp || 1;

  // 3. Compute cumulative points
  const pnlCurve = [{ pnl: 0, timestamp: startTimestamp, label: 'Start' }];
  let cumulative = 0;
  items.forEach(item => {
    cumulative += item.pnl;
    pnlCurve.push({
      pnl: cumulative,
      timestamp: item.date.getTime(),
      label: `${item.prefix}: ${item.name} (${item.pnl >= 0 ? '+' : ''}${item.pnl})`
    });
  });

  // 4. Map values to SVG coordinates (ViewBox 0 0 600 140)
  const width = 600;
  const height = 140;
  const paddingX = 35;
  const paddingY = 20;

  const pnlValues = pnlCurve.map(c => c.pnl);
  const minPnL = Math.min(...pnlValues, 0); // include 0 for baseline
  const maxPnL = Math.max(...pnlValues, 0);
  const pnlRange = maxPnL - minPnL === 0 ? 1 : maxPnL - minPnL;

  const getX = (timestamp) => {
    return paddingX + ((timestamp - startTimestamp) / timeRange) * (width - 2 * paddingX);
  };

  const getY = (pnl) => {
    return height - paddingY - ((pnl - minPnL) / pnlRange) * (height - 2 * paddingY);
  };

  const points = pnlCurve.map(c => ({
    x: getX(c.timestamp),
    y: getY(c.pnl),
    pnl: c.pnl,
    label: c.label,
    date: c.timestamp === startTimestamp ? null : new Date(c.timestamp)
  }));

  const pathD = points.reduce((acc, p, idx) => {
    return acc + `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, '');

  // Area path for background gradient
  const areaD = pathD + 
    ` L ${points[points.length - 1].x.toFixed(1)} ${(height - paddingY).toFixed(1)}` +
    ` L ${points[0].x.toFixed(1)} ${(height - paddingY).toFixed(1)} Z`;

  const zeroY = getY(0);

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Color config - always emerald green as requested
  const strokeColor = '#10b981';
  const areaGradId = 'emerald-area-grad';
  const glowColorClass = 'shadow-[0_0_6px_rgba(16,185,129,0.5)]';

  // Get dynamic titles
  const chartTitle = isFuturesMode 
    ? 'Futures Equity Curve' 
    : isWeb3Mode 
      ? 'Web3 Revenue Curve' 
      : 'Combined Performance Curve';

  const chartSub = isFuturesMode 
    ? 'Cumulative futures PnL history' 
    : isWeb3Mode 
      ? 'Cumulative Web3 activities income' 
      : 'Total unified portfolio PnL curve';

  const labelPrefix = isFuturesMode 
    ? 'Futures PnL' 
    : isWeb3Mode 
      ? 'Web3 PnL' 
      : 'Combined PnL';

  return (
    <div className="glass-panel p-4 relative overflow-hidden shine-effect">
      <div className="flex justify-between items-center mb-3 border-b border-slate-700/25 pb-2.5">
        <div>
          <h3 className="text-xs font-bold premium-title text-slate-100 flex items-center gap-2">
            {chartTitle}
          </h3>
          <p className="text-[9px] text-slate-500">{chartSub}</p>
        </div>
        
        {/* Curve indicator */}
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
          <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${glowColorClass}`}></span>
          <span>
            {labelPrefix}:{' '}
            <strong className={cumulative >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {cumulative >= 0 ? '+' : ''}${cumulative.toLocaleString()}
            </strong>
          </span>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.08" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Dotted helper lines */}
          <line 
            x1={paddingX} 
            y1={getY(maxPnL)} 
            x2={width - paddingX} 
            y2={getY(maxPnL)} 
            stroke="#334155" 
            strokeDasharray="2 3" 
            strokeWidth="0.5" 
            strokeOpacity="0.6"
          />
          <line 
            x1={paddingX} 
            y1={getY(minPnL)} 
            x2={width - paddingX} 
            y2={getY(minPnL)} 
            stroke="#334155" 
            strokeDasharray="2 3" 
            strokeWidth="0.5" 
            strokeOpacity="0.6"
          />

          {/* Baseline zero line */}
          {zeroY >= paddingY && zeroY <= height - paddingY && (
            <line 
              x1={paddingX} 
              y1={zeroY} 
              x2={width - paddingX} 
              y2={zeroY} 
              stroke="#475569" 
              strokeWidth="0.75" 
              strokeOpacity="0.3"
            />
          )}

          {/* Area under the line gradient fill */}
          <path d={areaD} fill={`url(#${areaGradId})`} />

          {/* Line Path */}
          {points.length > 1 && (
            <path 
              d={pathD} 
              fill="none" 
              stroke={strokeColor} 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          )}

          {/* Dot Points for interactive hover */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint === idx ? 4.5 : 2.5}
                fill={hoveredPoint === idx ? strokeColor : '#1e293b'}
                stroke={strokeColor}
                strokeWidth="1.25"
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredPoint !== null && (
          <div 
            className="absolute z-20 px-3 py-2 bg-slate-950/95 border border-slate-700/80 rounded-xl shadow-xl text-[9px] text-slate-300 pointer-events-none"
            style={{
              left: `${(points[hoveredPoint].x / width) * 100}%`,
              top: `${(points[hoveredPoint].y / height) * 100 - 30}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-bold text-slate-100">{points[hoveredPoint].label}</div>
            <div className="flex gap-2 justify-between mt-1 text-slate-500 font-medium">
              <span>Cumulative: <strong className={points[hoveredPoint].pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>${points[hoveredPoint].pnl}</strong></span>
              {points[hoveredPoint].date && <span>• {formatDate(points[hoveredPoint].date)}</span>}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-2.5 text-[8px] text-slate-550 px-1 font-semibold">
        <span>{formatDate(minDate) || 'Start'}</span>
        <span>{formatDate(maxDate)}</span>
      </div>
    </div>
  );
}
