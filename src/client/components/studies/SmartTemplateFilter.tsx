import React from 'react';
import { Search, Filter, X, Star, Clock, Users, Tag } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export interface FilterOptions {
  searchQuery: string;
  duration: 'any' | 'quick' | 'medium' | 'long'; // < 10min, 10-30min, > 30min
  complexity: 'any' | 'beginner' | 'intermediate' | 'advanced';
  popularity: 'any' | 'popular' | 'trending';
  tags: string[];
}

interface SmartTemplateFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableTags: string[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export const SmartTemplateFilter: React.FC<SmartTemplateFilterProps> = ({
  filters,
  onFiltersChange,
  availableTags,
  isExpanded,
  onToggleExpanded
}) => {
  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    updateFilter('tags', newTags);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchQuery: '',
      duration: 'any',
      complexity: 'any',
      popularity: 'any',
      tags: []
    });
  };

  const hasActiveFilters = filters.searchQuery || 
    filters.duration !== 'any' || 
    filters.complexity !== 'any' || 
    filters.popularity !== 'any' || 
    filters.tags.length > 0;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search templates by name, description, or keywords..."
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {filters.searchQuery && (
          <button
            onClick={() => updateFilter('searchQuery', '')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpanded}
          className="text-gray-600 hover:text-gray-800"
        >
          <Filter className="h-4 w-4 mr-2" />
          {isExpanded ? 'Hide Filters' : 'Show Filters'}
          {hasActiveFilters && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {[
                filters.duration !== 'any' ? 1 : 0,
                filters.complexity !== 'any' ? 1 : 0,
                filters.popularity !== 'any' ? 1 : 0,
                filters.tags.length
              ].reduce((sum, count) => sum + count, 0)}
            </span>
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <Card className="border border-gray-200">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Duration Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Duration
                </label>
                <select
                  value={filters.duration}
                  onChange={(e) => updateFilter('duration', e.target.value as FilterOptions['duration'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="any">Any duration</option>
                  <option value="quick">Quick (≤ 10 min)</option>
                  <option value="medium">Medium (10-30 min)</option>
                  <option value="long">Long (&gt; 30 min)</option>
                </select>
              </div>

              {/* Complexity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Star className="inline h-4 w-4 mr-1" />
                  Complexity
                </label>
                <select
                  value={filters.complexity}
                  onChange={(e) => updateFilter('complexity', e.target.value as FilterOptions['complexity'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="any">Any level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Popularity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  Popularity
                </label>
                <select
                  value={filters.popularity}
                  onChange={(e) => updateFilter('popularity', e.target.value as FilterOptions['popularity'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="any">Any popularity</option>
                  <option value="popular">Most popular</option>
                  <option value="trending">Trending now</option>
                </select>
              </div>
            </div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="inline h-4 w-4 mr-1" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        filters.tags.includes(tag)
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.duration !== 'any' && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              <Clock className="h-3 w-3" />
              {filters.duration}
              <button
                onClick={() => updateFilter('duration', 'any')}
                className="ml-1 hover:text-blue-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {filters.complexity !== 'any' && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              <Star className="h-3 w-3" />
              {filters.complexity}
              <button
                onClick={() => updateFilter('complexity', 'any')}
                className="ml-1 hover:text-blue-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {filters.popularity !== 'any' && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              <Users className="h-3 w-3" />
              {filters.popularity}
              <button
                onClick={() => updateFilter('popularity', 'any')}
                className="ml-1 hover:text-blue-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {filters.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              <Tag className="h-3 w-3" />
              {tag}
              <button
                onClick={() => toggleTag(tag)}
                className="ml-1 hover:text-blue-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
