/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Project, SearchFilters, StatsSummary } from "./types";
import { StatsGrid } from "./components/StatsGrid";
import { SearchPanel } from "./components/SearchPanel";
import { Visuals } from "./components/Visuals";
import { ProjectTable } from "./components/ProjectTable";
import { ProjectDetail } from "./components/ProjectDetail";
import { CompareDrawer } from "./components/CompareDrawer";
import { 
  Building2, 
  BarChart3, 
  TableProperties, 
  Info
} from "lucide-react";

// Load pre-bundled project data
import rawProjectsData from "./data.json";

// Typecast the JSON data
const projectsData = rawProjectsData as Project[];

// Helper to normalize Vietnamese search text
const normalizeText = (str: string): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim();
};

const INITIAL_FILTERS: SearchFilters = {
  xaPhuong: "",
  tenDuAn: "",
  mucDich: "",
  phanLoai: "",
  minDienTichTh: 0,
  maxDienTichTh: 100000,
};

export default function App() {
  const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS);
  const [activeTab, setActiveTab] = useState<"list" | "visuals">("list");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProjectsForCompare, setSelectedProjectsForCompare] = useState<Project[]>([]);

  // Extract unique filter fields from ALL project data
  const { uniqueWards, uniquePurposes, uniqueClassifications } = useMemo(() => {
    const wards = new Set<string>();
    const purposes = new Set<string>();
    const classifications = new Set<string>();

    projectsData.forEach((p) => {
      if (p.xaPhuong) wards.add(p.xaPhuong);
      if (p.mucDich) purposes.add(p.mucDich);
      if (p.phanLoai) classifications.add(p.phanLoai);
    });

    return {
      uniqueWards: Array.from(wards).sort((a, b) => a.localeCompare(b, "vi")),
      uniquePurposes: Array.from(purposes).sort((a, b) => a.localeCompare(b, "vi")),
      uniqueClassifications: Array.from(classifications).sort((a, b) => a.localeCompare(b, "vi")),
    };
  }, []);

  // Filter projects dynamically
  const filteredProjects = useMemo(() => {
    return projectsData.filter((p) => {
      // 1. Ward/Commune Match
      if (filters.xaPhuong) {
        const normPWard = normalizeText(p.xaPhuong);
        const normPName = normalizeText(p.tenDuAn);
        const normPDonVi = normalizeText(p.donVi || "");
        const normQueryWard = normalizeText(filters.xaPhuong);
        if (!normPWard.includes(normQueryWard) && 
            !normPName.includes(normQueryWard) && 
            !normPDonVi.includes(normQueryWard)) {
          return false;
        }
      }

      // 2. Project Name Match (full or partial, tone-insensitive)
      if (filters.tenDuAn) {
        const normPName = normalizeText(p.tenDuAn);
        const normPWard = normalizeText(p.xaPhuong);
        const normPDonVi = normalizeText(p.donVi || "");
        const normQueryName = normalizeText(filters.tenDuAn);
        if (!normPName.includes(normQueryName) && 
            !normPWard.includes(normQueryName) && 
            !normPDonVi.includes(normQueryName)) {
          return false;
        }
      }

      // 3. Purpose Match (exact, from dropdown)
      if (filters.mucDich && p.mucDich !== filters.mucDich) {
        return false;
      }

      // 4. Classification Match (exact, from dropdown)
      if (filters.phanLoai && p.phanLoai !== filters.phanLoai) {
        return false;
      }

      // 5. Recovered Area Range Match
      if (p.dienTichTh < filters.minDienTichTh || p.dienTichTh > filters.maxDienTichTh) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // Compute stats on the FLY for the currently filtered subset
  const stats = useMemo((): StatsSummary => {
    const count = filteredProjects.length;
    let totalP = 0;
    let totalR = 0;
    let sumRatio = 0;
    let fullyCount = 0;

    filteredProjects.forEach((p) => {
      totalP += p.dienTichDa;
      totalR += p.dienTichTh;
      
      const ratio = p.dienTichDa > 0 ? (p.dienTichTh / p.dienTichDa) * 100 : 100;
      sumRatio += Math.min(100, ratio);
      
      if (ratio >= 99.9) {
        fullyCount += 1;
      }
    });

    return {
      totalProjects: count,
      totalProjectArea: totalP,
      totalRecoveredArea: totalR,
      avgRecoveryRatio: count > 0 ? sumRatio / count : 0,
      fullyRecoveredCount: fullyCount,
    };
  }, [filteredProjects]);

  // Filter handlers
  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  // Comparison toggle handler
  const handleToggleCompare = (project: Project) => {
    const isExist = selectedProjectsForCompare.some(
      (p) => p.tenDuAn === project.tenDuAn && p.xaPhuong === project.xaPhuong
    );

    if (isExist) {
      setSelectedProjectsForCompare(
        selectedProjectsForCompare.filter(
          (p) => !(p.tenDuAn === project.tenDuAn && p.xaPhuong === project.xaPhuong)
        )
      );
    } else {
      if (selectedProjectsForCompare.length >= 3) {
        alert("Bạn chỉ có thể so sánh tối đa 3 dự án cùng một lúc.");
        return;
      }
      setSelectedProjectsForCompare([...selectedProjectsForCompare, project]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/70 text-gray-950 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900 pb-24">
      {/* Top Header Block */}
      <header className="bg-white border-b border-gray-150/80 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-md text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-950 flex items-center gap-2 tracking-tight">
                Tra cứu danh mục dự án thu hồi đất tại Hà Nội
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Hệ thống tra cứu, thống kê & phân loại các dự án tới 2030
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col gap-6 w-full">

        {/* Dynamic Statistics Block */}
        <StatsGrid stats={stats} />

        {/* Search & Filter Component */}
        <SearchPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          uniqueWards={uniqueWards}
          uniquePurposes={uniquePurposes}
          uniqueClassifications={uniqueClassifications}
          onReset={handleResetFilters}
          totalRecords={filteredProjects.length}
        />

        {/* View Toggle and Controls */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mt-2">
          {/* Tabs Navigation */}
          <div className="flex items-center gap-1 bg-gray-150 p-1 rounded-xl">
            <button
              type="button"
              id="tab-list"
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 outline-none ${
                activeTab === "list"
                  ? "bg-white text-gray-950 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <TableProperties className="w-4 h-4 text-emerald-600" />
              Bảng dữ liệu ({filteredProjects.length.toLocaleString("vi-VN")})
            </button>
            <button
              type="button"
              id="tab-visuals"
              onClick={() => setActiveTab("visuals")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 outline-none ${
                activeTab === "visuals"
                  ? "bg-white text-gray-950 shadow-xs"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Biểu đồ phân tích
            </button>
          </div>

          {/* Table guide indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 font-sans">
            <Info className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>Click vào tên dự án để xem bản phân tích chi tiết quy mô thu hồi.</span>
          </div>
        </div>

        {/* Main Content Render */}
        <div className="flex-1">
          {activeTab === "list" ? (
            <ProjectTable
              projects={filteredProjects}
              searchQuery={filters.tenDuAn}
              wardQuery={filters.xaPhuong}
              onSelectProject={(project) => setSelectedProject(project)}
              selectedProjectsForCompare={selectedProjectsForCompare}
              onToggleCompare={handleToggleCompare}
            />
          ) : (
            <Visuals projects={filteredProjects} />
          )}
        </div>
      </main>

      {/* Floating compare drawers if there are items selected */}
      <CompareDrawer
        selectedProjects={selectedProjectsForCompare}
        onRemoveProject={handleToggleCompare}
        onClearAll={() => setSelectedProjectsForCompare([])}
      />

      {/* Side Detail Overlay Modal */}
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
