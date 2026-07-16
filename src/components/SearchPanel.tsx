/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, SlidersHorizontal, RefreshCw, X, ArrowUpDown, ChevronDown } from "lucide-react";
import { SearchFilters } from "../types";

interface SearchPanelProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  uniqueWards: string[];
  uniquePurposes: string[];
  uniqueClassifications: string[];
  onReset: () => void;
  totalRecords: number;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  filters,
  onFilterChange,
  uniqueWards,
  uniquePurposes,
  uniqueClassifications,
  onReset,
  totalRecords
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [wardQuery, setWardQuery] = useState(filters.xaPhuong);
  const [showWardSuggestions, setShowWardSuggestions] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Sync ward input query with parent filter state
  useEffect(() => {
    setWardQuery(filters.xaPhuong);
  }, [filters.xaPhuong]);

  // Handle click outside autocomplete suggestion box
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
        setShowWardSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredWards = uniqueWards.filter((ward) =>
    ward.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .includes(wardQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
  );

  const handleWardSelect = (ward: string) => {
    setWardQuery(ward);
    onFilterChange({ ...filters, xaPhuong: ward });
    setShowWardSuggestions(false);
  };

  const handleClearWard = () => {
    setWardQuery("");
    onFilterChange({ ...filters, xaPhuong: "" });
  };

  const handleAreaPreset = (min: number, max: number) => {
    onFilterChange({
      ...filters,
      minDienTichTh: min,
      maxDienTichTh: max
    });
  };

  const activePresets = [
    { label: "Tất cả quy mô", min: 0, max: 100000 },
    { label: "Dưới 1 ha", min: 0, max: 1 },
    { label: "Từ 1 - 5 ha", min: 1, max: 5 },
    { label: "Từ 5 - 10 ha", min: 5, max: 10 },
    { label: "Trên 10 ha", min: 10, max: 100000 }
  ];

  const currentPresetIndex = activePresets.findIndex(
    p => p.min === filters.minDienTichTh && p.max === filters.maxDienTichTh
  );

  return (
    <div id="search-panel" className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm transition-all duration-300">
      {/* Primary search row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Project Name Search */}
        <div className="lg:col-span-5 relative">
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Tên dự án (Đầy đủ hoặc 1 phần)
          </label>
          <div className="relative">
            <input
              id="search-project-name"
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 hover:border-gray-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-xl outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400 font-sans"
              placeholder="Nhập tên dự án (ví dụ: Trường tiểu học, Cầu Tân Phú, Đường...)"
              value={filters.tenDuAn}
              onChange={(e) => onFilterChange({ ...filters, tenDuAn: e.target.value })}
            />
            <Search className="w-4.5 h-4.5 text-gray-400 absolute left-3.5 top-3" />
            {filters.tenDuAn && (
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, tenDuAn: "" })}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200/50 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Ward/Commune search with Autocomplete */}
        <div className="lg:col-span-4 relative" ref={autocompleteRef}>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
            Xã / Phường / Thị trấn
          </label>
          <div className="relative">
            <input
              id="search-ward"
              type="text"
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50/80 border border-gray-200 hover:border-gray-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-xl outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400 font-sans"
              placeholder="Nhập xã/phường (ví dụ: An Khánh, Ba Đình...)"
              value={wardQuery}
              onChange={(e) => {
                setWardQuery(e.target.value);
                setShowWardSuggestions(true);
                // Also update filter instantly for typing
                onFilterChange({ ...filters, xaPhuong: e.target.value });
              }}
              onFocus={() => setShowWardSuggestions(true)}
            />
            <MapPin className="w-4.5 h-4.5 text-gray-400 absolute left-3.5 top-3" />
            {wardQuery ? (
              <button
                type="button"
                onClick={handleClearWard}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200/50 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
            )}
          </div>

          {/* Ward Suggestions Dropdown */}
          {showWardSuggestions && (
            <div className="absolute z-30 w-full mt-1.5 bg-white border border-gray-150 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1">
              {filteredWards.length > 0 ? (
                filteredWards.map((ward) => (
                  <button
                    key={ward}
                    type="button"
                    onClick={() => handleWardSelect(ward)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50/80 hover:text-emerald-700 transition-all flex items-center gap-2 font-sans"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{ward}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-2.5 text-xs text-gray-400 font-sans italic">
                  Không tìm thấy xã/phường "{wardQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action buttons and Advanced toggle */}
        <div className="lg:col-span-3 flex items-end gap-2">
          <button
            type="button"
            id="btn-advanced-filters"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex-1 py-2.5 px-3 border rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all outline-none ${
              showAdvanced || filters.mucDich || filters.phanLoai
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Bộ lọc nâng cao
          </button>
          
          <button
            type="button"
            id="btn-reset-filters"
            onClick={() => {
              onReset();
              setWardQuery("");
            }}
            className="p-2.5 border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-xl transition-all tooltip"
            title="Đặt lại bộ lọc"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Advanced search panel */}
      {(showAdvanced || filters.mucDich || filters.phanLoai) && (
        <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          {/* Purpose Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
              Mục đích sử dụng
            </label>
            <select
              id="filter-purpose"
              value={filters.mucDich}
              onChange={(e) => onFilterChange({ ...filters, mucDich: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50/80 border border-gray-200 hover:border-gray-300 focus:bg-white focus:border-emerald-500 rounded-xl outline-none text-sm text-gray-700 transition-all font-sans"
            >
              <option value="">Tất cả mục đích ({uniquePurposes.length})</option>
              {uniquePurposes.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Classification Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
              Phân loại nguồn vốn
            </label>
            <select
              id="filter-classification"
              value={filters.phanLoai}
              onChange={(e) => onFilterChange({ ...filters, phanLoai: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50/80 border border-gray-200 hover:border-gray-300 focus:bg-white focus:border-emerald-500 rounded-xl outline-none text-sm text-gray-700 transition-all font-sans"
            >
              <option value="">Tất cả nguồn vốn</option>
              {uniqueClassifications.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Recovered Area FilterPresets */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
              Diện tích thu hồi (Héc-ta)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {activePresets.map((preset, idx) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleAreaPreset(preset.min, preset.max)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    (currentPresetIndex === idx) || 
                    (filters.minDienTichTh === preset.min && filters.maxDienTichTh === preset.max)
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick summary of matches */}
      {(filters.xaPhuong || filters.tenDuAn || filters.mucDich || filters.phanLoai || filters.minDienTichTh > 0 || filters.maxDienTichTh < 100000) && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 bg-gray-50/50 px-4 py-2 rounded-xl border border-dashed border-gray-200 text-xs text-gray-500 animate-fade-in">
          <div className="font-sans flex items-center gap-1.5">
            <span>Tìm thấy <strong className="text-gray-900 font-bold">{totalRecords.toLocaleString("vi-VN")}</strong> dự án</span>
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium text-[10px]">
              Đang lọc
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
