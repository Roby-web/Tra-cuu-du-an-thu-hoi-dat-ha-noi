/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Project {
  xaPhuong: string;
  tenDuAn: string;
  mucDich: string;
  donVi: string;
  dienTichDa: number;
  dienTichTh: number;
  phanLoai: string;
}

export interface SearchFilters {
  xaPhuong: string;
  tenDuAn: string;
  mucDich: string;
  phanLoai: string;
  minDienTichTh: number;
  maxDienTichTh: number;
}

export interface StatsSummary {
  totalProjects: number;
  totalProjectArea: number;
  totalRecoveredArea: number;
  avgRecoveryRatio: number;
  fullyRecoveredCount: number;
}
