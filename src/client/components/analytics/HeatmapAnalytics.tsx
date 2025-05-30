import React, { useEffect, useRef, useState } from 'react';
import { 
  BarChart3,
  Download,
  RefreshCw
} from 'lucide-react';

interface HeatmapData {
  x: number;
  y: number;
  intensity: number;
  eventType: 'click' | 'move' | 'scroll' | 'hover';
  timestamp: number;
  elementId?: string;
  elementText?: string;
}

interface HeatmapAnalyticsProps {
  sessionId?: string;
  studyId?: string;
  data: HeatmapData[];
  width?: number;
  height?: number;
  showControls?: boolean;
  type?: 'click' | 'move' | 'scroll' | 'all';
}

export const HeatmapAnalytics: React.FC<HeatmapAnalyticsProps> = ({
  sessionId: _sessionId,
  studyId: _studyId,
  data,
  width = 1920,
  height = 1080,
  showControls = true,
  type = 'all'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [heatmapType, setHeatmapType] = useState<'click' | 'move' | 'scroll' | 'all'>(type);
  const [intensity, setIntensity] = useState(50);
  const [radius, setRadius] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filteredData, setFilteredData] = useState<HeatmapData[]>([]);

  // Filter data based on selected type
  useEffect(() => {
    if (heatmapType === 'all') {
      setFilteredData(data);
    } else {
      setFilteredData(data.filter(point => point.eventType === heatmapType));
    }
  }, [data, heatmapType]);

  // Generate heatmap
  const generateHeatmap = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || filteredData.length === 0) return;

    setIsGenerating(true);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Create gradient for heatmap points
    const createGradient = (x: number, y: number, intensity: number) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      const alpha = Math.min(intensity / 100, 1);
      
      gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha})`);
      gradient.addColorStop(0.4, `rgba(255, 165, 0, ${alpha * 0.8})`);
      gradient.addColorStop(0.8, `rgba(255, 255, 0, ${alpha * 0.4})`);
      gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);
      
      return gradient;
    };

    // Draw heatmap points
    ctx.globalCompositeOperation = 'screen';
    
    filteredData.forEach(point => {
      const adjustedIntensity = point.intensity * (intensity / 100);
      const gradient = createGradient(point.x, point.y, adjustedIntensity);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    setIsGenerating(false);
  }, [filteredData, width, height, intensity, radius]);

  // Regenerate heatmap when parameters change
  useEffect(() => {
    generateHeatmap();
  }, [generateHeatmap]);

  // Get color for event type
  const getEventTypeColor = (eventType: string) => {
    const colors = {
      click: 'bg-red-500',
      move: 'bg-blue-500',
      scroll: 'bg-green-500',
      hover: 'bg-yellow-500',
      all: 'bg-purple-500'
    };
    return colors[eventType as keyof typeof colors] || 'bg-gray-500';
  };

  // Export heatmap as image
  const exportHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `heatmap-${heatmapType}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    const clickData = data.filter(d => d.eventType === 'click');
    const moveData = data.filter(d => d.eventType === 'move');
    const scrollData = data.filter(d => d.eventType === 'scroll');
    
    return {
      totalInteractions: data.length,
      clicks: clickData.length,
      movements: moveData.length,
      scrolls: scrollData.length,
      avgIntensity: data.reduce((sum, d) => sum + d.intensity, 0) / data.length || 0,
      hotspots: findHotspots(data)
    };
  }, [data]);

  // Find interaction hotspots
  function findHotspots(points: HeatmapData[], gridSize = 100) {
    const grid: { [key: string]: { count: number; totalIntensity: number } } = {};
    
    points.forEach(point => {
      const gridX = Math.floor(point.x / gridSize);
      const gridY = Math.floor(point.y / gridSize);
      const key = `${gridX}-${gridY}`;
      
      if (!grid[key]) {
        grid[key] = { count: 0, totalIntensity: 0 };
      }
      
      grid[key].count++;
      grid[key].totalIntensity += point.intensity;
    });

    return Object.entries(grid)
      .map(([key, value]) => ({
        position: key,
        count: value.count,
        avgIntensity: value.totalIntensity / value.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Interaction Heatmap</h3>
            <p className="text-sm text-gray-500 mt-1">
              Visual representation of user interactions and behavior patterns
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={generateHeatmap}
              disabled={isGenerating}
              className="flex items-center px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </button>
            <button
              onClick={exportHeatmap}
              className="flex items-center px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.totalInteractions}</div>
            <div className="text-sm text-gray-500">Total Interactions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.clicks}</div>
            <div className="text-sm text-gray-500">Clicks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.movements}</div>
            <div className="text-sm text-gray-500">Mouse Movements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.scrolls}</div>
            <div className="text-sm text-gray-500">Scroll Events</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Event Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <div className="flex flex-wrap gap-2">
                {['all', 'click', 'move', 'scroll'].map((eventType) => (
                  <button
                    key={eventType}
                    onClick={() => setHeatmapType(eventType as any)}
                    className={`flex items-center px-3 py-2 text-sm rounded-lg border transition-colors ${
                      heatmapType === eventType
                        ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full mr-2 ${getEventTypeColor(eventType)}`} />
                    {eventType.charAt(0).toUpperCase() + eventType.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intensity: {intensity}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Radius Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Radius: {radius}px
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Heatmap Canvas */}
      <div className="p-6">
        <div className="relative overflow-auto bg-gray-100 rounded-lg" style={{ maxHeight: '600px' }}>
          <canvas
            ref={canvasRef}
            className="border border-gray-300"
            style={{
              maxWidth: '100%',
              height: 'auto'
            }}
          />
          {filteredData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No interaction data available</p>
                <p className="text-sm text-gray-400">
                  Start a session to collect heatmap data
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hotspots Analysis */}
      {stats.hotspots.length > 0 && (
        <div className="p-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Top Interaction Hotspots</h4>
          <div className="space-y-2">
            {stats.hotspots.map((hotspot, index) => (
              <div key={hotspot.position} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-red-500 text-white text-xs flex items-center justify-center rounded-full mr-3">
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-700">Area {hotspot.position}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{hotspot.count} interactions</span>
                  <span>{Math.round(hotspot.avgIntensity)}% avg intensity</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeatmapAnalytics;
