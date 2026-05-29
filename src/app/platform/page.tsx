"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl, { Map as MLMap, Marker, Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./platform.css";

/* ─────────────────────────────────────────────
   TYPES & MOCK DATA
   ───────────────────────────────────────────── */

type Level = "critical" | "high" | "moderate" | "low";

type FactorTone = "critical" | "high" | "moderate" | "low" | "mute";

interface City {
  name: string;
  /** Real geographic coordinates: [lng, lat] */
  coords: [number, number];
}

interface Corridor {
  id: string;
  name: string;
  short: string;
  from: City;
  to: City;
  level: Level;
  stressIndex: number;
  delta: number;
  trend: number[]; // 7-day index trend
  customers: number;
  customersDelta: number;
  outageRisk: number; // %
  outageRiskDelta: number;
  infraAtRisk: number;
  infraDelta: number;
  factors: { label: string; pct: number; tone: FactorTone }[];
  alerts: {
    tone: "critical" | "warning";
    title: string;
    subtitle: string;
    time: string;
  }[];
  bottom: {
    monitored: number;
    monitoredDelta: number; // %
    online: number;
    onlinePct: number; // %
    outOfService: number;
    outDelta: number; // %
    weather: "LOW" | "MODERATE" | "HIGH" | "SEVERE";
    weatherTone: Level;
    loadMw: number;
    loadDelta: number; // %
  };
  lastUpdated: string;
}

const CORRIDORS: Corridor[] = [
  /* ── CRITICAL ── */
  {
    id: "toronto-oshawa",
    name: "Toronto — Oshawa",
    short: "TOR–OSH",
    from: { name: "Toronto", coords: [-79.3832, 43.6532] },
    to: { name: "Oshawa", coords: [-78.8658, 43.8971] },
    level: "critical",
    stressIndex: 92,
    delta: 8,
    trend: [62, 68, 71, 75, 80, 86, 92],
    customers: 128_450,
    customersDelta: 15_230,
    outageRisk: 35,
    outageRiskDelta: 5,
    infraAtRisk: 247,
    infraDelta: 23,
    factors: [
      { label: "High Demand", pct: 40, tone: "critical" },
      { label: "Extreme Weather", pct: 25, tone: "high" },
      { label: "Infrastructure Load", pct: 20, tone: "moderate" },
      { label: "Maintenance Backlog", pct: 10, tone: "low" },
      { label: "Other", pct: 5, tone: "mute" },
    ],
    alerts: [
      {
        tone: "critical",
        title: "Severe Thunderstorm Watch",
        subtitle: "Southwestern Ontario",
        time: "10:15 AM",
      },
      {
        tone: "warning",
        title: "High Load Forecast",
        subtitle: "Toronto — Oshawa Corridor",
        time: "09:45 AM",
      },
    ],
    bottom: {
      monitored: 12_843,
      monitoredDelta: 1.2,
      online: 11_256,
      onlinePct: 87.6,
      outOfService: 1_587,
      outDelta: 12.4,
      weather: "HIGH",
      weatherTone: "critical",
      loadMw: 23_450,
      loadDelta: 6.3,
    },
    lastUpdated: "Jul 9, 2025  ·  10:30 AM EST",
  },
  {
    id: "windsor-london",
    name: "Windsor — London",
    short: "WIN–LON",
    from: { name: "Windsor", coords: [-83.0364, 42.3149] },
    to: { name: "London", coords: [-81.2453, 42.9849] },
    level: "critical",
    stressIndex: 88,
    delta: 6,
    trend: [70, 72, 74, 78, 81, 85, 88],
    customers: 96_120,
    customersDelta: 9_870,
    outageRisk: 31,
    outageRiskDelta: 4,
    infraAtRisk: 198,
    infraDelta: 15,
    factors: [
      { label: "Industrial Load", pct: 38, tone: "critical" },
      { label: "High Demand", pct: 27, tone: "high" },
      { label: "Aging Equipment", pct: 18, tone: "moderate" },
      { label: "Weather Exposure", pct: 11, tone: "low" },
      { label: "Other", pct: 6, tone: "mute" },
    ],
    alerts: [
      {
        tone: "critical",
        title: "Substation Overload Alert",
        subtitle: "Tecumseh TS, Windsor",
        time: "11:02 AM",
      },
      {
        tone: "warning",
        title: "Auto-Sector Peak Demand",
        subtitle: "Windsor — London zone",
        time: "10:18 AM",
      },
    ],
    bottom: {
      monitored: 9_412,
      monitoredDelta: 0.9,
      online: 8_290,
      onlinePct: 88.1,
      outOfService: 1_122,
      outDelta: 9.6,
      weather: "MODERATE",
      weatherTone: "moderate",
      loadMw: 18_240,
      loadDelta: 4.8,
    },
    lastUpdated: "Jul 9, 2025  ·  10:28 AM EST",
  },
  {
    id: "toronto-hamilton",
    name: "Toronto — Hamilton",
    short: "TOR–HAM",
    from: { name: "Toronto", coords: [-79.3832, 43.6532] },
    to: { name: "Hamilton", coords: [-79.8711, 43.2557] },
    level: "critical",
    stressIndex: 86,
    delta: 7,
    trend: [60, 65, 70, 74, 79, 83, 86],
    customers: 118_290,
    customersDelta: 12_640,
    outageRisk: 29,
    outageRiskDelta: 4,
    infraAtRisk: 213,
    infraDelta: 18,
    factors: [
      { label: "Commuter Belt Demand", pct: 36, tone: "critical" },
      { label: "Heat Wave Impact", pct: 24, tone: "high" },
      { label: "QEW Corridor Load", pct: 21, tone: "moderate" },
      { label: "Aging Infrastructure", pct: 12, tone: "low" },
      { label: "Other", pct: 7, tone: "mute" },
    ],
    alerts: [
      {
        tone: "critical",
        title: "Burlington TS at 94% Capacity",
        subtitle: "Burlington Junction",
        time: "11:18 AM",
      },
      {
        tone: "warning",
        title: "Cooling Demand Surge",
        subtitle: "GTA West",
        time: "10:50 AM",
      },
    ],
    bottom: {
      monitored: 11_204,
      monitoredDelta: 1.1,
      online: 9_820,
      onlinePct: 87.7,
      outOfService: 1_384,
      outDelta: 11.2,
      weather: "HIGH",
      weatherTone: "critical",
      loadMw: 21_180,
      loadDelta: 5.9,
    },
    lastUpdated: "Jul 9, 2025  ·  10:34 AM EST",
  },
  {
    id: "niagara-stcatharines",
    name: "Niagara Falls — St. Catharines",
    short: "NFL–STC",
    from: { name: "Niagara Falls", coords: [-79.0747, 43.0962] },
    to: { name: "St. Catharines", coords: [-79.2469, 43.1594] },
    level: "critical",
    stressIndex: 84,
    delta: 5,
    trend: [68, 70, 73, 76, 79, 82, 84],
    customers: 74_320,
    customersDelta: 6_180,
    outageRisk: 27,
    outageRiskDelta: 3,
    infraAtRisk: 168,
    infraDelta: 11,
    factors: [
      { label: "Generation Output Peak", pct: 34, tone: "critical" },
      { label: "Cross-Border Export", pct: 26, tone: "high" },
      { label: "Tourism Demand", pct: 19, tone: "moderate" },
      { label: "Aging Transmission", pct: 14, tone: "low" },
      { label: "Other", pct: 7, tone: "mute" },
    ],
    alerts: [
      {
        tone: "critical",
        title: "Sir Adam Beck Output 99%",
        subtitle: "Niagara Generation Complex",
        time: "11:35 AM",
      },
      {
        tone: "warning",
        title: "Export Tieline Saturation",
        subtitle: "NY-Ontario Interconnect",
        time: "10:22 AM",
      },
    ],
    bottom: {
      monitored: 7_890,
      monitoredDelta: 0.8,
      online: 7_040,
      onlinePct: 89.2,
      outOfService: 850,
      outDelta: 7.4,
      weather: "MODERATE",
      weatherTone: "high",
      loadMw: 16_720,
      loadDelta: 4.2,
    },
    lastUpdated: "Jul 9, 2025  ·  10:33 AM EST",
  },

  /* ── HIGH ── */
  {
    id: "ottawa-kingston",
    name: "Ottawa — Kingston",
    short: "OTT–KGN",
    from: { name: "Ottawa", coords: [-75.6972, 45.4215] },
    to: { name: "Kingston", coords: [-76.486, 44.2312] },
    level: "high",
    stressIndex: 71,
    delta: 3,
    trend: [60, 63, 65, 67, 69, 70, 71],
    customers: 58_730,
    customersDelta: 4_120,
    outageRisk: 22,
    outageRiskDelta: 2,
    infraAtRisk: 134,
    infraDelta: 8,
    factors: [
      { label: "Government Sector Demand", pct: 32, tone: "high" },
      { label: "Seasonal Heating Load", pct: 26, tone: "moderate" },
      { label: "Transmission Congestion", pct: 21, tone: "moderate" },
      { label: "Maintenance Backlog", pct: 14, tone: "low" },
      { label: "Other", pct: 7, tone: "mute" },
    ],
    alerts: [
      {
        tone: "warning",
        title: "Capacity Threshold Reached",
        subtitle: "Kingston East TS",
        time: "09:55 AM",
      },
      {
        tone: "warning",
        title: "Wind Advisory",
        subtitle: "Eastern Ontario",
        time: "09:20 AM",
      },
    ],
    bottom: {
      monitored: 6_840,
      monitoredDelta: 0.4,
      online: 6_310,
      onlinePct: 92.3,
      outOfService: 530,
      outDelta: 3.1,
      weather: "MODERATE",
      weatherTone: "moderate",
      loadMw: 11_870,
      loadDelta: 2.7,
    },
    lastUpdated: "Jul 9, 2025  ·  10:31 AM EST",
  },
  {
    id: "sudbury-northbay",
    name: "Sudbury — North Bay",
    short: "SUD–NBY",
    from: { name: "Sudbury", coords: [-80.993, 46.4917] },
    to: { name: "North Bay", coords: [-79.4608, 46.3091] },
    level: "high",
    stressIndex: 68,
    delta: 4,
    trend: [55, 58, 60, 62, 64, 66, 68],
    customers: 41_200,
    customersDelta: 3_640,
    outageRisk: 19,
    outageRiskDelta: 3,
    infraAtRisk: 112,
    infraDelta: 9,
    factors: [
      { label: "Aging Equipment", pct: 34, tone: "high" },
      { label: "Mining Sector Load", pct: 24, tone: "moderate" },
      { label: "Extreme Cold Reserve", pct: 19, tone: "moderate" },
      { label: "Remote Access Backlog", pct: 16, tone: "low" },
      { label: "Other", pct: 7, tone: "mute" },
    ],
    alerts: [
      {
        tone: "warning",
        title: "Feeder Maintenance Overdue",
        subtitle: "Hwy 17 Corridor",
        time: "08:40 AM",
      },
      {
        tone: "warning",
        title: "Industrial Spike Detected",
        subtitle: "Sudbury Basin",
        time: "08:05 AM",
      },
    ],
    bottom: {
      monitored: 4_920,
      monitoredDelta: 0.3,
      online: 4_530,
      onlinePct: 92.1,
      outOfService: 390,
      outDelta: 4.4,
      weather: "LOW",
      weatherTone: "low",
      loadMw: 7_640,
      loadDelta: 1.9,
    },
    lastUpdated: "Jul 9, 2025  ·  10:29 AM EST",
  },
  {
    id: "kitchener-toronto",
    name: "Kitchener — Toronto",
    short: "KIT–TOR",
    from: { name: "Kitchener", coords: [-80.492, 43.4516] },
    to: { name: "Toronto", coords: [-79.3832, 43.6532] },
    level: "high",
    stressIndex: 74,
    delta: 4,
    trend: [60, 63, 66, 68, 71, 72, 74],
    customers: 84_510,
    customersDelta: 6_920,
    outageRisk: 24,
    outageRiskDelta: 3,
    infraAtRisk: 156,
    infraDelta: 12,
    factors: [
      { label: "Tech Corridor Demand", pct: 35, tone: "high" },
      { label: "401 Commuter Belt", pct: 23, tone: "moderate" },
      { label: "Data Center Load", pct: 20, tone: "moderate" },
      { label: "Substation Wear", pct: 14, tone: "low" },
      { label: "Other", pct: 8, tone: "mute" },
    ],
    alerts: [
      {
        tone: "warning",
        title: "Detweiler TS Loading 88%",
        subtitle: "Kitchener",
        time: "10:42 AM",
      },
      {
        tone: "warning",
        title: "Data Centre Load Forecast",
        subtitle: "Cambridge Cluster",
        time: "09:58 AM",
      },
    ],
    bottom: {
      monitored: 8_310,
      monitoredDelta: 0.7,
      online: 7_510,
      onlinePct: 90.4,
      outOfService: 800,
      outDelta: 5.2,
      weather: "MODERATE",
      weatherTone: "moderate",
      loadMw: 14_320,
      loadDelta: 3.6,
    },
    lastUpdated: "Jul 9, 2025  ·  10:36 AM EST",
  },
  {
    id: "windsor-sarnia",
    name: "Windsor — Sarnia",
    short: "WIN–SAR",
    from: { name: "Windsor", coords: [-83.0364, 42.3149] },
    to: { name: "Sarnia", coords: [-82.4066, 42.9994] },
    level: "high",
    stressIndex: 69,
    delta: 3,
    trend: [58, 60, 63, 65, 67, 68, 69],
    customers: 62_440,
    customersDelta: 4_810,
    outageRisk: 21,
    outageRiskDelta: 2,
    infraAtRisk: 142,
    infraDelta: 10,
    factors: [
      { label: "Petrochemical Load", pct: 38, tone: "high" },
      { label: "Cross-Border Trade", pct: 22, tone: "moderate" },
      { label: "Refinery Cooling", pct: 18, tone: "moderate" },
      { label: "Aging Tielines", pct: 14, tone: "low" },
      { label: "Other", pct: 8, tone: "mute" },
    ],
    alerts: [
      {
        tone: "warning",
        title: "Lambton TS Alarm Latched",
        subtitle: "Sarnia Industrial Park",
        time: "10:08 AM",
      },
      {
        tone: "warning",
        title: "Cooling Tower Anomaly",
        subtitle: "Refinery Row",
        time: "09:14 AM",
      },
    ],
    bottom: {
      monitored: 6_120,
      monitoredDelta: 0.5,
      online: 5_540,
      onlinePct: 90.5,
      outOfService: 580,
      outDelta: 4.0,
      weather: "MODERATE",
      weatherTone: "moderate",
      loadMw: 12_840,
      loadDelta: 3.1,
    },
    lastUpdated: "Jul 9, 2025  ·  10:30 AM EST",
  },
  {
    id: "toronto-niagara",
    name: "Toronto — Niagara Falls",
    short: "TOR–NFL",
    from: { name: "Toronto", coords: [-79.3832, 43.6532] },
    to: { name: "Niagara Falls", coords: [-79.0747, 43.0962] },
    level: "high",
    stressIndex: 72,
    delta: 4,
    trend: [58, 61, 64, 66, 69, 71, 72],
    customers: 92_180,
    customersDelta: 7_240,
    outageRisk: 23,
    outageRiskDelta: 3,
    infraAtRisk: 174,
    infraDelta: 13,
    factors: [
      { label: "Generation Transfer", pct: 36, tone: "high" },
      { label: "Lake-effect Storms", pct: 22, tone: "moderate" },
      { label: "Tourism Peak", pct: 18, tone: "moderate" },
      { label: "Hammertown Splice", pct: 16, tone: "low" },
      { label: "Other", pct: 8, tone: "mute" },
    ],
    alerts: [
      {
        tone: "warning",
        title: "Hannon TS Reactive Power Low",
        subtitle: "Hannon, Hamilton",
        time: "10:25 AM",
      },
      {
        tone: "warning",
        title: "Tieline Phase Imbalance",
        subtitle: "Beck — Middleport",
        time: "09:48 AM",
      },
    ],
    bottom: {
      monitored: 9_140,
      monitoredDelta: 0.8,
      online: 8_280,
      onlinePct: 90.6,
      outOfService: 860,
      outDelta: 5.6,
      weather: "MODERATE",
      weatherTone: "moderate",
      loadMw: 15_240,
      loadDelta: 3.8,
    },
    lastUpdated: "Jul 9, 2025  ·  10:35 AM EST",
  },
  {
    id: "barrie-toronto",
    name: "Barrie — Toronto",
    short: "BAR–TOR",
    from: { name: "Barrie", coords: [-79.6903, 44.3894] },
    to: { name: "Toronto", coords: [-79.3832, 43.6532] },
    level: "high",
    stressIndex: 66,
    delta: 3,
    trend: [54, 57, 59, 61, 63, 65, 66],
    customers: 71_320,
    customersDelta: 5_180,
    outageRisk: 20,
    outageRiskDelta: 2,
    infraAtRisk: 138,
    infraDelta: 9,
    factors: [
      { label: "Cottage-Country Surge", pct: 31, tone: "high" },
      { label: "Hwy 400 Commute", pct: 25, tone: "moderate" },
      { label: "Summer A/C Load", pct: 20, tone: "moderate" },
      { label: "Right-of-Way Trees", pct: 16, tone: "low" },
      { label: "Other", pct: 8, tone: "mute" },
    ],
    alerts: [
      {
        tone: "warning",
        title: "Vegetation Encroachment",
        subtitle: "Holland Marsh Section",
        time: "08:55 AM",
      },
      {
        tone: "warning",
        title: "Essa TS Load Climb",
        subtitle: "Innisfil — Barrie",
        time: "07:42 AM",
      },
    ],
    bottom: {
      monitored: 7_240,
      monitoredDelta: 0.6,
      online: 6_610,
      onlinePct: 91.3,
      outOfService: 630,
      outDelta: 4.2,
      weather: "MODERATE",
      weatherTone: "moderate",
      loadMw: 11_310,
      loadDelta: 2.9,
    },
    lastUpdated: "Jul 9, 2025  ·  10:31 AM EST",
  },

  {
    id: "brampton-toronto",
    name: "Brampton — Toronto",
    short: "BRA–TOR",
    from: { name: "Brampton", coords: [-79.7624, 43.7315] },
    to: { name: "Toronto", coords: [-79.3832, 43.6532] },
    level: "critical",
    stressIndex: 89,
    delta: 9,
    trend: [58, 65, 70, 76, 81, 85, 89],
    customers: 142_380,
    customersDelta: 18_640,
    outageRisk: 34,
    outageRiskDelta: 6,
    infraAtRisk: 261,
    infraDelta: 28,
    factors: [
      { label: "EV Charging Surge", pct: 38, tone: "critical" },
      { label: "Suburban Demand Growth", pct: 27, tone: "high" },
      { label: "Feeder Capacity Limit", pct: 19, tone: "moderate" },
      { label: "Aging Substations", pct: 10, tone: "low" },
      { label: "Other", pct: 6, tone: "mute" },
    ],
    alerts: [
      {
        tone: "critical",
        title: "Alectra Feeder BRA-07 at 96%",
        subtitle: "Brampton North Zone",
        time: "10:42 AM",
      },
      {
        tone: "warning",
        title: "EV Overnight Load Spike",
        subtitle: "Brampton — Etobicoke",
        time: "09:55 AM",
      },
    ],
    bottom: {
      monitored: 13_920,
      monitoredDelta: 2.1,
      online: 12_180,
      onlinePct: 87.5,
      outOfService: 1_740,
      outDelta: 14.2,
      weather: "HIGH",
      weatherTone: "critical",
      loadMw: 24_810,
      loadDelta: 7.4,
    },
    lastUpdated: "Jul 9, 2025  ·  10:42 AM EST",
  },

  /* ── MODERATE ── */
  {
    id: "hamilton-stcatharines",
    name: "Hamilton — St. Catharines",
    short: "HAM–STC",
    from: { name: "Hamilton", coords: [-79.8711, 43.2557] },
    to: { name: "St. Catharines", coords: [-79.2469, 43.1594] },
    level: "moderate",
    stressIndex: 54,
    delta: 2,
    trend: [48, 49, 51, 52, 53, 54, 54],
    customers: 32_410,
    customersDelta: 1_840,
    outageRisk: 14,
    outageRiskDelta: 1,
    infraAtRisk: 87,
    infraDelta: 4,
    factors: [
      { label: "Industrial Steel Load", pct: 30, tone: "moderate" },
      { label: "Tourism Demand Spike", pct: 24, tone: "moderate" },
      { label: "Substation Loading", pct: 22, tone: "low" },
      { label: "Weather Exposure", pct: 16, tone: "low" },
      { label: "Other", pct: 8, tone: "mute" },
    ],
    alerts: [
      {
        tone: "warning",
        title: "Voltage Sag Recorded",
        subtitle: "St. Catharines DS",
        time: "07:48 AM",
      },
      {
        tone: "warning",
        title: "Festival Load Forecast",
        subtitle: "Hamilton Downtown",
        time: "07:12 AM",
      },
    ],
    bottom: {
      monitored: 5_320,
      monitoredDelta: 0.2,
      online: 5_080,
      onlinePct: 95.5,
      outOfService: 240,
      outDelta: 1.6,
      weather: "LOW",
      weatherTone: "low",
      loadMw: 9_180,
      loadDelta: 1.3,
    },
    lastUpdated: "Jul 9, 2025  ·  10:32 AM EST",
  },
  {
    id: "london-kitchener",
    name: "London — Kitchener",
    short: "LON–KIT",
    from: { name: "London", coords: [-81.2453, 42.9849] },
    to: { name: "Kitchener", coords: [-80.492, 43.4516] },
    level: "moderate",
    stressIndex: 58,
    delta: 2,
    trend: [50, 52, 53, 55, 56, 57, 58],
    customers: 46_870,
    customersDelta: 2_640,
    outageRisk: 16,
    outageRiskDelta: 1,
    infraAtRisk: 96,
    infraDelta: 5,
    factors: [
      { label: "401 Logistics Demand", pct: 28, tone: "moderate" },
      { label: "University Term Load", pct: 23, tone: "moderate" },
      { label: "Light Industrial", pct: 21, tone: "low" },
      { label: "Agriculture Cooling", pct: 18, tone: "low" },
      { label: "Other", pct: 10, tone: "mute" },
    ],
    alerts: [
      {
        tone: "warning",
        title: "Wonderland TS Brief Trip",
        subtitle: "London North",
        time: "08:18 AM",
      },
      {
        tone: "warning",
        title: "Animal Contact Outage",
        subtitle: "Woodstock Spur",
        time: "07:02 AM",
      },
    ],
    bottom: {
      monitored: 5_840,
      monitoredDelta: 0.3,
      online: 5_530,
      onlinePct: 94.7,
      outOfService: 310,
      outDelta: 2.1,
      weather: "LOW",
      weatherTone: "low",
      loadMw: 10_120,
      loadDelta: 1.8,
    },
    lastUpdated: "Jul 9, 2025  ·  10:33 AM EST",
  },
  {
    id: "peterborough-oshawa",
    name: "Peterborough — Oshawa",
    short: "PTB–OSH",
    from: { name: "Peterborough", coords: [-78.3232, 44.3091] },
    to: { name: "Oshawa", coords: [-78.8658, 43.8971] },
    level: "moderate",
    stressIndex: 52,
    delta: 2,
    trend: [44, 46, 48, 49, 50, 51, 52],
    customers: 28_910,
    customersDelta: 1_420,
    outageRisk: 13,
    outageRiskDelta: 1,
    infraAtRisk: 78,
    infraDelta: 3,
    factors: [
      { label: "Lakeside Cottage Load", pct: 30, tone: "moderate" },
      { label: "Substation Age", pct: 24, tone: "moderate" },
      { label: "Storm Exposure", pct: 20, tone: "low" },
      { label: "Light Manufacturing", pct: 16, tone: "low" },
      { label: "Other", pct: 10, tone: "mute" },
    ],
    alerts: [
      {
        tone: "warning",
        title: "Cavan Monaghan Feeder Trip",
        subtitle: "Rural Loop",
        time: "06:35 AM",
      },
      {
        tone: "warning",
        title: "Lightning Activity",
        subtitle: "Kawartha Lakes",
        time: "05:50 AM",
      },
    ],
    bottom: {
      monitored: 4_120,
      monitoredDelta: 0.2,
      online: 3_920,
      onlinePct: 95.1,
      outOfService: 200,
      outDelta: 1.3,
      weather: "LOW",
      weatherTone: "low",
      loadMw: 6_890,
      loadDelta: 1.0,
    },
    lastUpdated: "Jul 9, 2025  ·  10:34 AM EST",
  },
  {
    id: "kingston-belleville",
    name: "Kingston — Belleville",
    short: "KGN–BEL",
    from: { name: "Kingston", coords: [-76.486, 44.2312] },
    to: { name: "Belleville", coords: [-77.3833, 44.1628] },
    level: "moderate",
    stressIndex: 49,
    delta: 1,
    trend: [44, 45, 46, 47, 48, 48, 49],
    customers: 24_180,
    customersDelta: 980,
    outageRisk: 12,
    outageRiskDelta: 1,
    infraAtRisk: 71,
    infraDelta: 2,
    factors: [
      { label: "Hwy 401 Traffic Load", pct: 28, tone: "moderate" },
      { label: "Agricultural Pumping", pct: 22, tone: "low" },
      { label: "Substation Wear", pct: 21, tone: "low" },
      { label: "Tourism Demand", pct: 18, tone: "low" },
      { label: "Other", pct: 11, tone: "mute" },
    ],
    alerts: [
      {
        tone: "warning",
        title: "Napanee Spur Voltage Dip",
        subtitle: "Napanee Substation",
        time: "06:18 AM",
      },
      {
        tone: "warning",
        title: "Feeder Inspection Due",
        subtitle: "Quinte West",
        time: "05:30 AM",
      },
    ],
    bottom: {
      monitored: 3_640,
      monitoredDelta: 0.2,
      online: 3_490,
      onlinePct: 95.9,
      outOfService: 150,
      outDelta: 0.8,
      weather: "LOW",
      weatherTone: "low",
      loadMw: 5_910,
      loadDelta: 0.7,
    },
    lastUpdated: "Jul 9, 2025  ·  10:33 AM EST",
  },

  /* ── LOW ── */
  {
    id: "thunderbay-sault",
    name: "Thunder Bay — Sault Ste. Marie",
    short: "TBY–SSM",
    from: { name: "Thunder Bay", coords: [-89.2477, 48.3809] },
    to: { name: "Sault Ste. Marie", coords: [-84.3461, 46.4978] },
    level: "low",
    stressIndex: 22,
    delta: 1,
    trend: [18, 19, 20, 20, 21, 21, 22],
    customers: 14_620,
    customersDelta: 320,
    outageRisk: 6,
    outageRiskDelta: 0,
    infraAtRisk: 38,
    infraDelta: 1,
    factors: [
      { label: "Light Residential", pct: 32, tone: "low" },
      { label: "Mining Standby", pct: 24, tone: "low" },
      { label: "Seasonal Lodging", pct: 18, tone: "low" },
      { label: "Right-of-Way", pct: 14, tone: "mute" },
      { label: "Other", pct: 12, tone: "mute" },
    ],
    alerts: [
      {
        tone: "warning",
        title: "Routine Patrol Scheduled",
        subtitle: "Wawa to Sault corridor",
        time: "04:50 AM",
      },
    ],
    bottom: {
      monitored: 2_180,
      monitoredDelta: 0.1,
      online: 2_130,
      onlinePct: 97.7,
      outOfService: 50,
      outDelta: 0.3,
      weather: "LOW",
      weatherTone: "low",
      loadMw: 2_980,
      loadDelta: 0.4,
    },
    lastUpdated: "Jul 9, 2025  ·  10:30 AM EST",
  },
];

/* ─────────────────────────────────────────────
   SUBSTATIONS  (additional clickable nodes)
   ───────────────────────────────────────────── */

type SubStatus = "online" | "caution" | "offline";

interface Substation {
  id: string;
  name: string;
  code: string;
  /** [lng, lat] */
  coords: [number, number];
  /** Which corridor this substation primarily serves */
  corridorId: string;
  type: "Transmission" | "Distribution" | "Generation";
  capacityMva: number;
  loadPct: number;
  status: SubStatus;
}

const SUBSTATIONS: Substation[] = [
  // Toronto–Oshawa corridor
  {
    id: "sub-manby",
    name: "Manby TS",
    code: "MBY",
    coords: [-79.5189, 43.6492],
    corridorId: "toronto-oshawa",
    type: "Transmission",
    capacityMva: 1_500,
    loadPct: 89,
    status: "caution",
  },
  {
    id: "sub-cherrywood",
    name: "Cherrywood TS",
    code: "CHR",
    coords: [-79.0892, 43.842],
    corridorId: "toronto-oshawa",
    type: "Transmission",
    capacityMva: 1_280,
    loadPct: 92,
    status: "caution",
  },
  {
    id: "sub-leaside",
    name: "Leaside TS",
    code: "LSD",
    coords: [-79.358, 43.7065],
    corridorId: "toronto-oshawa",
    type: "Transmission",
    capacityMva: 960,
    loadPct: 84,
    status: "online",
  },

  // Windsor–London corridor
  {
    id: "sub-tecumseh",
    name: "Tecumseh TS",
    code: "TCM",
    coords: [-82.9035, 42.336],
    corridorId: "windsor-london",
    type: "Transmission",
    capacityMva: 720,
    loadPct: 95,
    status: "caution",
  },
  {
    id: "sub-chatham",
    name: "Chatham SS",
    code: "CHT",
    coords: [-82.1809, 42.4048],
    corridorId: "windsor-london",
    type: "Distribution",
    capacityMva: 320,
    loadPct: 78,
    status: "online",
  },

  // Toronto–Hamilton
  {
    id: "sub-burlington",
    name: "Burlington TS",
    code: "BUR",
    coords: [-79.799, 43.3255],
    corridorId: "toronto-hamilton",
    type: "Transmission",
    capacityMva: 1_120,
    loadPct: 94,
    status: "caution",
  },
  {
    id: "sub-horner",
    name: "Horner TS",
    code: "HRN",
    coords: [-79.5132, 43.6014],
    corridorId: "toronto-hamilton",
    type: "Distribution",
    capacityMva: 520,
    loadPct: 82,
    status: "online",
  },

  // Niagara
  {
    id: "sub-beck",
    name: "Sir Adam Beck",
    code: "BCK",
    coords: [-79.0586, 43.1542],
    corridorId: "niagara-stcatharines",
    type: "Generation",
    capacityMva: 1_932,
    loadPct: 99,
    status: "caution",
  },
  {
    id: "sub-niagara-stc",
    name: "Allanburg TS",
    code: "ALB",
    coords: [-79.2055, 43.082],
    corridorId: "niagara-stcatharines",
    type: "Transmission",
    capacityMva: 680,
    loadPct: 86,
    status: "online",
  },

  // Ottawa–Kingston
  {
    id: "sub-hawthorne",
    name: "Hawthorne TS",
    code: "HWT",
    coords: [-75.6258, 45.3812],
    corridorId: "ottawa-kingston",
    type: "Transmission",
    capacityMva: 1_240,
    loadPct: 73,
    status: "online",
  },
  {
    id: "sub-lennox",
    name: "Lennox GS",
    code: "LNX",
    coords: [-76.9762, 44.1581],
    corridorId: "ottawa-kingston",
    type: "Generation",
    capacityMva: 2_140,
    loadPct: 41,
    status: "online",
  },
  {
    id: "sub-cataraqui",
    name: "Cataraqui TS",
    code: "CTQ",
    coords: [-76.5419, 44.2566],
    corridorId: "ottawa-kingston",
    type: "Transmission",
    capacityMva: 540,
    loadPct: 71,
    status: "online",
  },

  // Sudbury–North Bay
  {
    id: "sub-crystal",
    name: "Crystal Falls",
    code: "CFL",
    coords: [-80.0641, 46.3995],
    corridorId: "sudbury-northbay",
    type: "Transmission",
    capacityMva: 320,
    loadPct: 68,
    status: "online",
  },
  {
    id: "sub-wawa",
    name: "Wawa TS",
    code: "WWA",
    coords: [-84.7732, 47.9852],
    corridorId: "thunderbay-sault",
    type: "Transmission",
    capacityMva: 180,
    loadPct: 22,
    status: "online",
  },

  // Kitchener–Toronto
  {
    id: "sub-detweiler",
    name: "Detweiler TS",
    code: "DTW",
    coords: [-80.471, 43.4205],
    corridorId: "kitchener-toronto",
    type: "Transmission",
    capacityMva: 720,
    loadPct: 88,
    status: "caution",
  },
  {
    id: "sub-trafalgar",
    name: "Trafalgar TS",
    code: "TFG",
    coords: [-79.7268, 43.5181],
    corridorId: "kitchener-toronto",
    type: "Transmission",
    capacityMva: 980,
    loadPct: 81,
    status: "online",
  },

  // Windsor–Sarnia
  {
    id: "sub-lambton",
    name: "Lambton TS",
    code: "LBT",
    coords: [-82.497, 42.782],
    corridorId: "windsor-sarnia",
    type: "Transmission",
    capacityMva: 880,
    loadPct: 87,
    status: "caution",
  },

  // Toronto–Niagara
  {
    id: "sub-hannon",
    name: "Hannon TS",
    code: "HNN",
    coords: [-79.8132, 43.1869],
    corridorId: "toronto-niagara",
    type: "Transmission",
    capacityMva: 760,
    loadPct: 83,
    status: "online",
  },

  // Barrie–Toronto
  {
    id: "sub-essa",
    name: "Essa TS",
    code: "ESS",
    coords: [-79.689, 44.2682],
    corridorId: "barrie-toronto",
    type: "Transmission",
    capacityMva: 640,
    loadPct: 76,
    status: "online",
  },
  {
    id: "sub-claireville",
    name: "Claireville TS",
    code: "CLV",
    coords: [-79.6064, 43.7613],
    corridorId: "barrie-toronto",
    type: "Transmission",
    capacityMva: 1_080,
    loadPct: 79,
    status: "online",
  },

  // London–Kitchener
  {
    id: "sub-wonderland",
    name: "Wonderland TS",
    code: "WND",
    coords: [-81.3061, 43.0125],
    corridorId: "london-kitchener",
    type: "Transmission",
    capacityMva: 480,
    loadPct: 72,
    status: "online",
  },
  {
    id: "sub-woodstock",
    name: "Woodstock TS",
    code: "WDS",
    coords: [-80.7464, 43.1306],
    corridorId: "london-kitchener",
    type: "Distribution",
    capacityMva: 240,
    loadPct: 64,
    status: "online",
  },

  // Peterborough–Oshawa
  {
    id: "sub-cavan",
    name: "Cavan Monaghan",
    code: "CVN",
    coords: [-78.5102, 44.182],
    corridorId: "peterborough-oshawa",
    type: "Distribution",
    capacityMva: 180,
    loadPct: 58,
    status: "online",
  },

  // Kingston–Belleville
  {
    id: "sub-napanee",
    name: "Napanee SS",
    code: "NPN",
    coords: [-76.9485, 44.2492],
    corridorId: "kingston-belleville",
    type: "Distribution",
    capacityMva: 220,
    loadPct: 61,
    status: "online",
  },
];

/* ─────────────────────────────────────────────
   EV CHARGING STATIONS  (+ grid capacity that feeds them)

   Capacity tiers mirror the Toronto Hydro available-capacity
   map: each public charging site is fed by a distribution
   feeder with a published "estimated available capacity".
   The four feeder bands below are the same ones Toronto Hydro
   publishes (2,000+ / 1,000–2,000 / 500–999 / 0–499 kVA) and
   they map cleanly onto our existing severity colour scale.
   ───────────────────────────────────────────── */

type ChargerTier = "abundant" | "ample" | "limited" | "constrained";

interface EVStation {
  id: string;
  name: string;
  operator: string;
  /** [lng, lat] */
  coords: [number, number];
  /** Region key — matches a corridor endpoint city so we can group usage */
  region: string;
  /** Which corridor this site sits inside (for filter visibility) */
  corridorId: string;
  level: "L2" | "DCFC";
  ports: number;
  /** Mean daily port utilisation — the demand / usage signal */
  utilizationPct: number;
  /** Feeder + substation feeding this site (Toronto Hydro style) */
  feederCode: string;
  substation: string;
  /** Feeder estimated available capacity (kVA) — the grid-headroom signal */
  availableKva: number;
  tier: ChargerTier;
}

/**
 * Real Toronto sites are anchored to the Toronto Hydro capacity map
 * (e.g. feeder 88-M15 → Richview TS → 2,000+ kVA). Everything outside
 * Toronto Hydro's licence area is plausible mock data in the same shape.
 */
const EV_STATIONS: EVStation[] = [
  /* ── TORONTO (Toronto Hydro capacity map) ── */
  {
    id: "ev-richview",
    name: "Richview Hub",
    operator: "Toronto Hydro / FLO",
    coords: [-79.5519, 43.6786],
    region: "Toronto",
    corridorId: "toronto-oshawa",
    level: "DCFC",
    ports: 12,
    utilizationPct: 61,
    feederCode: "88-M15",
    substation: "Richview TS",
    availableKva: 2_400,
    tier: "abundant",
  },
  {
    id: "ev-downtown",
    name: "Union Station Lot",
    operator: "Toronto Hydro / Ivy",
    coords: [-79.3806, 43.6453],
    region: "Toronto",
    corridorId: "toronto-oshawa",
    level: "DCFC",
    ports: 18,
    utilizationPct: 88,
    feederCode: "12-D04",
    substation: "Esplanade TS",
    availableKva: 420,
    tier: "constrained",
  },
  {
    id: "ev-leaside",
    name: "Leaside Commons",
    operator: "Ivy Charging",
    coords: [-79.3625, 43.704],
    region: "Toronto",
    corridorId: "toronto-oshawa",
    level: "L2",
    ports: 8,
    utilizationPct: 54,
    feederCode: "41-L09",
    substation: "Leaside TS",
    availableKva: 1_650,
    tier: "ample",
  },
  {
    id: "ev-scarborough",
    name: "Scarborough Town Centre",
    operator: "Tesla Supercharger",
    coords: [-79.2576, 43.7764],
    region: "Toronto",
    corridorId: "toronto-oshawa",
    level: "DCFC",
    ports: 16,
    utilizationPct: 73,
    feederCode: "63-M22",
    substation: "Cherrywood TS",
    availableKva: 760,
    tier: "limited",
  },
  {
    id: "ev-etobicoke",
    name: "Sherway Gardens",
    operator: "Electrify Canada",
    coords: [-79.5572, 43.6112],
    region: "Toronto",
    corridorId: "toronto-oshawa",
    level: "DCFC",
    ports: 10,
    utilizationPct: 67,
    feederCode: "88-M07",
    substation: "Manby TS",
    availableKva: 1_280,
    tier: "ample",
  },

  /* ── OSHAWA / DURHAM ── */
  {
    id: "ev-oshawa",
    name: "Oshawa Centre",
    operator: "Petro-Canada eV",
    coords: [-78.8741, 43.8975],
    region: "Oshawa",
    corridorId: "toronto-oshawa",
    level: "DCFC",
    ports: 8,
    utilizationPct: 49,
    feederCode: "OSH-14",
    substation: "Cherrywood TS",
    availableKva: 2_150,
    tier: "abundant",
  },

  /* ── BRAMPTON / PEEL (EV surge corridor) ── */
  {
    id: "ev-brampton",
    name: "Bramalea City Centre",
    operator: "Alectra / FLO",
    coords: [-79.7261, 43.7185],
    region: "Brampton",
    corridorId: "brampton-toronto",
    level: "DCFC",
    ports: 20,
    utilizationPct: 91,
    feederCode: "BRA-07",
    substation: "Claireville TS",
    availableKva: 310,
    tier: "constrained",
  },
  {
    id: "ev-brampton-n",
    name: "Mount Pleasant GO",
    operator: "Ivy Charging",
    coords: [-79.8174, 43.7011],
    region: "Brampton",
    corridorId: "brampton-toronto",
    level: "L2",
    ports: 14,
    utilizationPct: 82,
    feederCode: "BRA-11",
    substation: "Claireville TS",
    availableKva: 540,
    tier: "limited",
  },

  /* ── HAMILTON ── */
  {
    id: "ev-hamilton",
    name: "Limeridge Mall",
    operator: "Alectra eCharge",
    coords: [-79.8702, 43.2244],
    region: "Hamilton",
    corridorId: "toronto-hamilton",
    level: "DCFC",
    ports: 10,
    utilizationPct: 64,
    feederCode: "HAM-22",
    substation: "Burlington TS",
    availableKva: 880,
    tier: "limited",
  },

  /* ── NIAGARA ── */
  {
    id: "ev-niagara",
    name: "Niagara Outlets",
    operator: "Tesla Supercharger",
    coords: [-79.1402, 43.1668],
    region: "Niagara Falls",
    corridorId: "niagara-stcatharines",
    level: "DCFC",
    ports: 24,
    utilizationPct: 78,
    feederCode: "NFL-05",
    substation: "Allanburg TS",
    availableKva: 1_420,
    tier: "ample",
  },

  /* ── KITCHENER / WATERLOO ── */
  {
    id: "ev-kitchener",
    name: "Sportsworld Crossing",
    operator: "Ivy Charging",
    coords: [-80.4255, 43.4045],
    region: "Kitchener",
    corridorId: "kitchener-toronto",
    level: "DCFC",
    ports: 12,
    utilizationPct: 70,
    feederCode: "KIT-18",
    substation: "Detweiler TS",
    availableKva: 690,
    tier: "limited",
  },

  /* ── OTTAWA ── */
  {
    id: "ev-ottawa",
    name: "Lansdowne Park",
    operator: "Hydro Ottawa / FLO",
    coords: [-75.6829, 45.398],
    region: "Ottawa",
    corridorId: "ottawa-kingston",
    level: "DCFC",
    ports: 14,
    utilizationPct: 58,
    feederCode: "OTT-31",
    substation: "Hawthorne TS",
    availableKva: 2_600,
    tier: "abundant",
  },

  /* ── WINDSOR ── */
  {
    id: "ev-windsor",
    name: "Devonshire Mall",
    operator: "EnWin / Electrify",
    coords: [-83.0186, 42.2748],
    region: "Windsor",
    corridorId: "windsor-london",
    level: "DCFC",
    ports: 10,
    utilizationPct: 52,
    feederCode: "WIN-09",
    substation: "Tecumseh TS",
    availableKva: 1_180,
    tier: "ample",
  },

  /* ── LONDON ── */
  {
    id: "ev-london",
    name: "Masonville Place",
    operator: "London Hydro / Ivy",
    coords: [-81.2787, 43.0186],
    region: "London",
    corridorId: "windsor-london",
    level: "L2",
    ports: 9,
    utilizationPct: 46,
    feederCode: "LON-27",
    substation: "Wonderland TS",
    availableKva: 2_050,
    tier: "abundant",
  },

  /* ── BARRIE ── */
  {
    id: "ev-barrie",
    name: "Georgian Mall",
    operator: "Alectra / Tesla",
    coords: [-79.7064, 44.4055],
    region: "Barrie",
    corridorId: "barrie-toronto",
    level: "DCFC",
    ports: 8,
    utilizationPct: 60,
    feederCode: "BAR-12",
    substation: "Essa TS",
    availableKva: 940,
    tier: "limited",
  },
];

/* ─────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────── */

const fmt = (n: number) => n.toLocaleString("en-US");

const levelColor: Record<Level, string> = {
  critical: "#FF4D4D",
  high: "#FF8A3D",
  moderate: "#F4C040",
  low: "#4ADE80",
};

const factorColor: Record<FactorTone, string> = {
  critical: "#FF4D4D",
  high: "#FF8A3D",
  moderate: "#F4C040",
  low: "#4ADE80",
  mute: "rgba(255,255,255,.22)",
};

/* ── EV capacity tiers (Toronto Hydro feeder bands) ── */
const tierColor: Record<ChargerTier, string> = {
  abundant: "#4ADE80", // 2,000+ kVA
  ample: "#F4C040", // 1,000–2,000 kVA
  limited: "#FF8A3D", // 500–999 kVA
  constrained: "#FF4D4D", // 0–499 kVA
};

const tierLabel: Record<ChargerTier, string> = {
  abundant: "2,000+ kVA",
  ample: "1,000–2,000 kVA",
  limited: "500–999 kVA",
  constrained: "0–499 kVA",
};

const tierTone: Record<ChargerTier, FactorTone> = {
  abundant: "low",
  ample: "moderate",
  limited: "high",
  constrained: "critical",
};

/** Substation headroom (kVA) derived from rated capacity + current load. */
const subAvailableKva = (s: Substation) =>
  Math.round(s.capacityMva * 1000 * (1 - s.loadPct / 100));

/**
 * Summarised EV-growth read for a corridor — derived live from the
 * stations + substations already in the dataset, so it needs no
 * hand-authored copy per corridor. This is the panel that replaces
 * the old per-corridor "critical alerts" feed: instead of telling an
 * operator what just broke, it tells a *company* where EV demand and
 * grid headroom line up best for expansion.
 */
interface EvOutlook {
  verdict: string;
  verdictTone: FactorTone;
  summary: string;
  signals: { label: string; value: string; tone: FactorTone }[];
  sites: number;
}

function getEvOutlook(c: Corridor): EvOutlook {
  const cities = [c.from.name, c.to.name];
  const stations = EV_STATIONS.filter(
    (s) => s.corridorId === c.id || cities.includes(s.region),
  );
  const subs = SUBSTATIONS.filter((s) => s.corridorId === c.id);

  const ports = stations.reduce((a, s) => a + s.ports, 0);
  const avgUtil = stations.length
    ? Math.round(
        stations.reduce((a, s) => a + s.utilizationPct, 0) / stations.length,
      )
    : 0;
  const headroomKva = subs.reduce((a, s) => a + subAvailableKva(s), 0);
  const headroomMw = headroomKva / 1000;
  /* customer growth stands in for adoption momentum */
  const momentum = c.customersDelta;

  /* tones */
  const utilTone: FactorTone =
    avgUtil >= 85
      ? "critical"
      : avgUtil >= 70
        ? "high"
        : avgUtil >= 50
          ? "moderate"
          : "low";
  const headroomTone: FactorTone =
    headroomMw >= 12
      ? "low"
      : headroomMw >= 6
        ? "moderate"
        : headroomMw >= 2
          ? "high"
          : "critical";
  const momentumTone: FactorTone =
    momentum >= 14_000
      ? "critical"
      : momentum >= 8_000
        ? "high"
        : momentum >= 4_000
          ? "moderate"
          : "low";

  /* verdict: demand proven × grid able to absorb it */
  const hotDemand = avgUtil >= 70;
  const roomToGrow = headroomMw >= 6;
  let verdict: string;
  let verdictTone: FactorTone;
  let summary: string;
  if (hotDemand && roomToGrow) {
    verdict = "Expansion-ready";
    verdictTone = "low";
    summary =
      "Proven charging demand with feeder headroom to absorb new sites — the strongest near-term build case.";
  } else if (hotDemand && !roomToGrow) {
    verdict = "Demand-led, grid-tight";
    verdictTone = "high";
    summary =
      "Usage is high but feeders are near their limit — new capacity needs grid upgrades or off-peak load shaping.";
  } else if (!hotDemand && roomToGrow) {
    verdict = "Early-stage upside";
    verdictTone = "moderate";
    summary =
      "Ample grid headroom ahead of demand — a low-risk place to plant sites before utilisation climbs.";
  } else {
    verdict = "Watch & hold";
    verdictTone = "moderate";
    summary =
      "Moderate demand against limited headroom — monitor utilisation before committing new ports.";
  }

  return {
    verdict,
    verdictTone,
    summary,
    sites: stations.length,
    signals: [
      {
        label: "Charger Utilisation",
        value: `${avgUtil}%`,
        tone: utilTone,
      },
      {
        label: "Feeder Headroom",
        value:
          headroomMw >= 1
            ? `${headroomMw.toFixed(1)} MW`
            : `${headroomKva.toLocaleString("en-US")} kVA`,
        tone: headroomTone,
      },
      {
        label: "Public Ports",
        value: fmt(ports),
        tone: ports >= 40 ? "low" : ports >= 20 ? "moderate" : "high",
      },
      {
        label: "Adoption Momentum",
        value: `↑ ${fmt(momentum)}/yr`,
        tone: momentumTone,
      },
    ],
  };
}

/* Centroid of all corridor endpoints — used as the initial map view */
const ONTARIO_CENTER: [number, number] = [-79.5, 44.6];

/* ─────────────────────────────────────────────
   SUB-COMPONENTS (charts)
   ───────────────────────────────────────────── */

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 110,
    h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  const points = data
    .map((v, i) => `${i * stepX},${h - ((v - min) / range) * (h - 4) - 2}`)
    .join(" ");
  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
    >
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.4" />
    </svg>
  );
}

function TrendChart({ data, color }: { data: number[]; color: string }) {
  const w = 260,
    h = 110;
  const padL = 22,
    padR = 8,
    padT = 8,
    padB = 18;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const stepX = innerW / (data.length - 1);
  const points = data.map((v, i) => ({
    x: padL + i * stepX,
    y: padT + innerH - (v / 100) * innerH,
  }));
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const days = ["Jul 3", "Jul 4", "Jul 5", "Jul 6", "Jul 7", "Jul 8", "Jul 9"];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="trend-svg">
      {[0, 25, 50, 75, 100].map((g) => {
        const y = padT + innerH - (g / 100) * innerH;
        return (
          <g key={g}>
            <line
              x1={padL}
              y1={y}
              x2={w - padR}
              y2={y}
              className="trend-grid"
            />
            <text x={padL - 4} y={y + 3} className="trend-axis">
              {g}
            </text>
          </g>
        );
      })}
      <path d={pathD} className="trend-line" stroke={color} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.8" fill={color} />
      ))}
      {days.map((d, i) => (
        <text
          key={d}
          x={padL + i * stepX}
          y={h - 4}
          className="trend-axis trend-axis-x"
        >
          {d}
        </text>
      ))}
    </svg>
  );
}

function MiniDonut({ value, color }: { value: number; color: string }) {
  const r = 14;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg className="mini-donut" viewBox="0 0 36 36">
      <circle
        cx="18"
        cy="18"
        r={r}
        stroke="rgba(255,255,255,.08)"
        strokeWidth="3.6"
        fill="none"
      />
      <circle
        cx="18"
        cy="18"
        r={r}
        stroke={color}
        strokeWidth="3.6"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 18 18)"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   REAL MAP (MapLibre GL)
   ───────────────────────────────────────────── */

/**
 * Free dark vector tile style from CartoCDN (OpenStreetMap-based).
 * No API key required. Swap to Mapbox/MapTiler later by replacing this URL
 * and providing the appropriate accessToken/apiKey.
 */
const MAP_STYLE_URL =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

function GridMap({
  activeId,
  onSelect,
  levelFilter,
  showEv,
  onReady,
}: {
  activeId: string;
  onSelect: (id: string) => void;
  levelFilter: Set<Level>;
  showEv: boolean;
  onReady?: (zoomIn: () => void, zoomOut: () => void) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  /** City markers tracked with their level so we can hide them when filtered out. */
  const cityMarkersRef = useRef<
    { marker: Marker; level: Level; corridorId: string }[]
  >([]);
  /** Substation markers tracked with parent-corridor level for filter visibility. */
  const subMarkersRef = useRef<{ marker: Marker; level: Level }[]>([]);
  /** EV-station markers tracked with parent-corridor level + the EV-layer toggle. */
  const evMarkersRef = useRef<{ marker: Marker; level: Level }[]>([]);
  const popupRef = useRef<Popup | null>(null);
  const hoveredIdRef = useRef<string | null>(null);
  const onSelectRef = useRef(onSelect);
  const levelFilterRef = useRef(levelFilter);
  const showEvRef = useRef(showEv);
  const animRafRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);

  /* Keep latest props available inside long-lived map callbacks */
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    levelFilterRef.current = levelFilter;
  }, [levelFilter]);
  useEffect(() => {
    showEvRef.current = showEv;
  }, [showEv]);

  /* Initialize map once */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: ONTARIO_CENTER,
      zoom: 5.4,
      minZoom: 3,
      maxZoom: 14,
      attributionControl: { compact: true },
      pitchWithRotate: false,
    });

    map.on("load", () => {
      /* ── CORRIDORS source (with feature IDs so we can use feature-state for hover) ── */
      map.addSource("corridors", {
        type: "geojson",
        promoteId: "id",
        data: {
          type: "FeatureCollection",
          features: CORRIDORS.map((c) => ({
            type: "Feature",
            id: c.id,
            properties: {
              id: c.id,
              level: c.level,
              color: levelColor[c.level],
              name: c.name,
              stressIndex: c.stressIndex,
            },
            geometry: {
              type: "LineString",
              coordinates: [c.from.coords, c.to.coords],
            },
          })),
        },
      });

      /* Outer glow */
      map.addLayer({
        id: "corridors-glow",
        type: "line",
        source: "corridors",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": ["get", "color"],
          "line-width": [
            "case",
            ["==", ["get", "id"], activeId],
            16,
            ["boolean", ["feature-state", "hover"], false],
            12,
            8,
          ],
          "line-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.32,
            0.18,
          ],
          "line-blur": 6,
        },
      });

      /* Visible corridor stroke */
      map.addLayer({
        id: "corridors-line",
        type: "line",
        source: "corridors",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": ["get", "color"],
          "line-width": [
            "case",
            ["==", ["get", "id"], activeId],
            5.5,
            ["boolean", ["feature-state", "hover"], false],
            4.5,
            3,
          ],
          "line-opacity": 0.95,
        },
      });

      /**
       * FLOW LAYER — marching dashes on top of the line to convey
       * energy flow. The dash pattern is cycled in an animation loop below.
       * This is the canonical MapLibre/Mapbox "ant trail" technique.
       */
      map.addLayer({
        id: "corridors-flow",
        type: "line",
        source: "corridors",
        layout: { "line-cap": "butt", "line-join": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-opacity": 0.55,
          "line-width": ["case", ["==", ["get", "id"], activeId], 2.6, 1.6],
          "line-dasharray": [0, 4, 3],
        },
      });

      /* 14 pre-shifted dash patterns → smooth marching animation when cycled */
      const dashSeq: number[][] = [
        [0, 4, 3],
        [0.5, 4, 2.5],
        [1, 4, 2],
        [1.5, 4, 1.5],
        [2, 4, 1],
        [2.5, 4, 0.5],
        [3, 4, 0],
        [0, 0.5, 3, 3.5],
        [0, 1, 3, 3],
        [0, 1.5, 3, 2.5],
        [0, 2, 3, 2],
        [0, 2.5, 3, 1.5],
        [0, 3, 3, 1],
        [0, 3.5, 3, 0.5],
      ];
      let dashStep = 0;
      let lastTs = 0;
      const FRAME_MS = 70; // lower = faster flow
      const animate = (ts: number) => {
        if (ts - lastTs >= FRAME_MS) {
          dashStep = (dashStep + 1) % dashSeq.length;
          if (map.getLayer("corridors-flow")) {
            map.setPaintProperty(
              "corridors-flow",
              "line-dasharray",
              dashSeq[dashStep],
            );
          }
          lastTs = ts;
        }
        animRafRef.current = requestAnimationFrame(animate);
      };
      animRafRef.current = requestAnimationFrame(animate);

      /**
       * Wide INVISIBLE hit-area layer on top — makes clicking the
       * corridor MUCH more forgiving (you can click 18px around the line).
       * This is the standard MapLibre/Mapbox pattern for easy hit targets.
       */
      map.addLayer({
        id: "corridors-hit",
        type: "line",
        source: "corridors",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-opacity": 0, // invisible
          "line-width": 28, // huge hit area
        },
      });

      /* Click handler on the wide hit layer — selects the corridor AND opens a popup */
      map.on("click", "corridors-hit", (e) => {
        const f = e.features?.[0];
        const id = f?.properties?.id;
        if (typeof id !== "string") return;

        const c = CORRIDORS.find((x) => x.id === id);
        if (!c) return;

        /* update selection (side panel will reflect this) */
        onSelectRef.current(id);

        /* close any existing popup */
        popupRef.current?.remove();

        const col = levelColor[c.level];

        /* inline sparkline as raw SVG */
        const sparkW = 200,
          sparkH = 38;
        const minV = Math.min(...c.trend);
        const maxV = Math.max(...c.trend);
        const rng = maxV - minV || 1;
        const stepX = sparkW / (c.trend.length - 1);
        const pts = c.trend
          .map(
            (v, i) =>
              `${i * stepX},${sparkH - ((v - minV) / rng) * (sparkH - 4) - 2}`,
          )
          .join(" ");
        const sparkSvg = `
          <svg viewBox="0 0 ${sparkW} ${sparkH}" preserveAspectRatio="none" class="corr-popup-spark">
            <polyline points="${pts}" fill="none" stroke="${col}" stroke-width="1.5" />
          </svg>`;

        const html = `
          <div class="corr-popup">
            <div class="corr-popup-head">
              <span class="corr-popup-name">${c.name}</span>
              <span class="corr-popup-level corr-popup-level-${c.level}">${c.level.toUpperCase()}</span>
            </div>
            <div class="corr-popup-big">
              <div class="corr-popup-bignum" style="color:${col}">${c.stressIndex}</div>
              <div class="corr-popup-bigside">
                <span class="corr-popup-biglbl">STRESS INDEX</span>
                <span class="corr-popup-delta" style="color:${col}">↑ ${c.delta} vs yesterday</span>
              </div>
            </div>
            ${sparkSvg}
            <div class="corr-popup-grid">
              <div class="corr-popup-cell">
                <span class="corr-popup-cell-lbl">AFFECTED</span>
                <span class="corr-popup-cell-val">${c.customers.toLocaleString("en-US")}</span>
              </div>
              <div class="corr-popup-cell">
                <span class="corr-popup-cell-lbl">OUTAGE RISK (24H)</span>
                <span class="corr-popup-cell-val" style="color:${col}">${c.outageRisk}%</span>
              </div>
              <div class="corr-popup-cell">
                <span class="corr-popup-cell-lbl">INFRA AT RISK</span>
                <span class="corr-popup-cell-val">${c.infraAtRisk}</span>
              </div>
              <div class="corr-popup-cell">
                <span class="corr-popup-cell-lbl">LOAD (MW)</span>
                <span class="corr-popup-cell-val">${c.bottom.loadMw.toLocaleString("en-US")}</span>
              </div>
            </div>
          </div>
        `;

        const popup = new maplibregl.Popup({
          offset: 14,
          closeButton: true,
          closeOnClick: false,
          className: "corr-popup-wrap",
          maxWidth: "320px",
        })
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(map);

        popupRef.current = popup;
      });

      /* Hover handler — set/unset feature-state for visual feedback */
      map.on("mousemove", "corridors-hit", (e) => {
        const f = e.features?.[0];
        const id = f?.properties?.id;
        if (typeof id !== "string") return;

        map.getCanvas().style.cursor = "pointer";

        if (hoveredIdRef.current && hoveredIdRef.current !== id) {
          map.setFeatureState(
            { source: "corridors", id: hoveredIdRef.current },
            { hover: false },
          );
        }
        hoveredIdRef.current = id;
        map.setFeatureState({ source: "corridors", id }, { hover: true });
      });

      map.on("mouseleave", "corridors-hit", () => {
        map.getCanvas().style.cursor = "";
        if (hoveredIdRef.current) {
          map.setFeatureState(
            { source: "corridors", id: hoveredIdRef.current },
            { hover: false },
          );
          hoveredIdRef.current = null;
        }
      });

      /* ── CITY MARKERS (DOM-based, clickable) ── */
      const seen = new Map<
        string,
        {
          city: { name: string; coords: [number, number] };
          corridorId: string;
          level: Level;
        }
      >();
      CORRIDORS.forEach((c) => {
        [c.from, c.to].forEach((city) => {
          const key = `${city.name}-${city.coords[0]}`;
          /* If we've seen this city, keep the highest-stress corridor reference */
          const existing = seen.get(key);
          if (existing) {
            const order: Record<Level, number> = {
              critical: 4,
              high: 3,
              moderate: 2,
              low: 1,
            };
            if (order[c.level] > order[existing.level]) {
              seen.set(key, { city, corridorId: c.id, level: c.level });
            }
          } else {
            seen.set(key, { city, corridorId: c.id, level: c.level });
          }
        });
      });

      seen.forEach(({ city, corridorId, level }) => {
        const el = document.createElement("div");
        el.className = "city-marker";
        el.setAttribute("role", "button");
        el.setAttribute("tabindex", "0");
        el.setAttribute("aria-label", `Select corridor at ${city.name}`);
        el.dataset.level = level;
        el.innerHTML = `
          <span class="city-marker-pulse" style="border-color:${levelColor[level]}"></span>
          <span class="city-marker-dot" style="background:${levelColor[level]}"></span>
          <span class="city-marker-label">${city.name.toUpperCase()}</span>
        `;

        const select = () => onSelectRef.current(corridorId);
        el.addEventListener("click", (ev) => {
          ev.stopPropagation();
          select();
        });
        el.addEventListener("keydown", (ev) => {
          if (
            (ev as KeyboardEvent).key === "Enter" ||
            (ev as KeyboardEvent).key === " "
          ) {
            ev.preventDefault();
            select();
          }
        });

        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat(city.coords)
          .addTo(map);
        markersRef.current.push(marker);
        cityMarkersRef.current.push({ marker, level, corridorId });
      });

      /* ── SUBSTATION MARKERS (smaller, clickable → popup + selects parent corridor) ── */
      SUBSTATIONS.forEach((sub) => {
        const el = document.createElement("div");
        el.className = `sub-marker sub-status-${sub.status}`;
        el.setAttribute("role", "button");
        el.setAttribute("tabindex", "0");
        el.setAttribute("aria-label", `Substation ${sub.name}`);
        el.innerHTML = `
          <span class="sub-marker-ring"></span>
          <span class="sub-marker-core"></span>
        `;

        const statusLabel: Record<SubStatus, string> = {
          online:
            '<span class="sub-pop-status sub-pop-status-online">ONLINE</span>',
          caution:
            '<span class="sub-pop-status sub-pop-status-caution">CAUTION</span>',
          offline:
            '<span class="sub-pop-status sub-pop-status-offline">OFFLINE</span>',
        };

        const loadTone =
          sub.loadPct >= 90
            ? "#FF4D4D"
            : sub.loadPct >= 80
              ? "#FF8A3D"
              : sub.loadPct >= 65
                ? "#F4C040"
                : "#4ADE80";

        const openPopup = () => {
          /* close any existing popup */
          popupRef.current?.remove();

          const html = `
            <div class="sub-popup">
              <div class="sub-popup-head">
                <span class="sub-popup-code">${sub.code}</span>
                <span class="sub-popup-name">${sub.name}</span>
              </div>
              <div class="sub-popup-row">
                <span class="sub-popup-lbl">TYPE</span>
                <span class="sub-popup-val">${sub.type}</span>
              </div>
              <div class="sub-popup-row">
                <span class="sub-popup-lbl">CAPACITY</span>
                <span class="sub-popup-val">${sub.capacityMva.toLocaleString("en-US")} MVA</span>
              </div>
              <div class="sub-popup-row">
                <span class="sub-popup-lbl">CURRENT LOAD</span>
                <span class="sub-popup-val" style="color:${loadTone}">${sub.loadPct}%</span>
              </div>
              <div class="sub-popup-bar">
                <div class="sub-popup-bar-fill" style="width:${sub.loadPct}%;background:${loadTone}"></div>
              </div>
              <div class="sub-popup-foot">
                ${statusLabel[sub.status]}
                <button type="button" class="sub-popup-cta" data-corridor-id="${sub.corridorId}">
                  View corridor →
                </button>
              </div>
            </div>
          `;

          const popup = new maplibregl.Popup({
            offset: 14,
            closeButton: false,
            closeOnClick: true,
            className: "sub-popup-wrap",
            maxWidth: "260px",
          })
            .setLngLat(sub.coords)
            .setHTML(html)
            .addTo(map);

          /* Hook the "View corridor" button inside the popup */
          setTimeout(() => {
            const btn = document.querySelector(
              `.sub-popup-cta[data-corridor-id="${sub.corridorId}"]`,
            ) as HTMLElement | null;
            btn?.addEventListener("click", () => {
              onSelectRef.current(sub.corridorId);
              popup.remove();
            });
          }, 0);

          popupRef.current = popup;
        };

        el.addEventListener("click", (ev) => {
          ev.stopPropagation();
          openPopup();
        });
        el.addEventListener("keydown", (ev) => {
          if (
            (ev as KeyboardEvent).key === "Enter" ||
            (ev as KeyboardEvent).key === " "
          ) {
            ev.preventDefault();
            openPopup();
          }
        });

        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat(sub.coords)
          .addTo(map);
        markersRef.current.push(marker);

        /* Track level via the parent corridor for filter visibility */
        const parentCorridor = CORRIDORS.find((c) => c.id === sub.corridorId);
        if (parentCorridor) {
          subMarkersRef.current.push({ marker, level: parentCorridor.level });
        }
      });

      /* ── EV CHARGING STATION MARKERS (capacity-tiered, clickable) ── */
      EV_STATIONS.forEach((stn) => {
        const tColor = tierColor[stn.tier];
        const el = document.createElement("div");
        el.className = `ev-marker ev-tier-${stn.tier} ev-lvl-${stn.level.toLowerCase()}`;
        el.setAttribute("role", "button");
        el.setAttribute("tabindex", "0");
        el.setAttribute("aria-label", `EV charging site ${stn.name}`);
        el.style.setProperty("--ev-color", tColor);
        /* DCFC = filled bolt pin, L2 = hollow — quick visual rank */
        el.innerHTML = `
          <span class="ev-marker-pin">
            <svg viewBox="0 0 24 24" aria-hidden>
              <path class="ev-bolt" d="M13 2 L5 13 L11 13 L10 22 L19 10 L13 10 Z" />
            </svg>
          </span>
          <span class="ev-marker-pulse"></span>
        `;

        const openPopup = () => {
          popupRef.current?.remove();
          const html = `
            <div class="ev-popup">
              <div class="ev-popup-head">
                <span class="ev-popup-bolt" style="color:${tColor}">
                  <svg viewBox="0 0 24 24"><path d="M13 2 L5 13 L11 13 L10 22 L19 10 L13 10 Z" fill="currentColor"/></svg>
                </span>
                <span class="ev-popup-name">${stn.name}</span>
                <span class="ev-popup-lvl">${stn.level}</span>
              </div>
              <div class="ev-popup-op">${stn.operator}</div>
              <div class="ev-popup-grid">
                <div class="ev-popup-cell">
                  <span class="ev-popup-cell-lbl">PORTS</span>
                  <span class="ev-popup-cell-val">${stn.ports}</span>
                </div>
                <div class="ev-popup-cell">
                  <span class="ev-popup-cell-lbl">UTILISATION</span>
                  <span class="ev-popup-cell-val">${stn.utilizationPct}%</span>
                </div>
                <div class="ev-popup-cell">
                  <span class="ev-popup-cell-lbl">FEEDER</span>
                  <span class="ev-popup-cell-val">${stn.feederCode}</span>
                </div>
                <div class="ev-popup-cell">
                  <span class="ev-popup-cell-lbl">SUBSTATION</span>
                  <span class="ev-popup-cell-val">${stn.substation}</span>
                </div>
              </div>
              <div class="ev-popup-cap">
                <div class="ev-popup-cap-row">
                  <span class="ev-popup-cap-lbl">FEEDER AVAILABLE CAPACITY</span>
                  <span class="ev-popup-cap-val" style="color:${tColor}">${stn.availableKva.toLocaleString("en-US")} kVA</span>
                </div>
                <div class="ev-popup-cap-bar">
                  <div class="ev-popup-cap-fill" style="width:${Math.min(100, (stn.availableKva / 2500) * 100)}%;background:${tColor}"></div>
                </div>
                <span class="ev-popup-tier" style="color:${tColor};border-color:${tColor}">${tierLabel[stn.tier].toUpperCase()}</span>
              </div>
              <div class="ev-popup-foot">
                <button type="button" class="ev-popup-cta" data-corridor-id="${stn.corridorId}">
                  View corridor →
                </button>
              </div>
            </div>
          `;
          const popup = new maplibregl.Popup({
            offset: 16,
            closeButton: true,
            closeOnClick: true,
            className: "ev-popup-wrap",
            maxWidth: "280px",
          })
            .setLngLat(stn.coords)
            .setHTML(html)
            .addTo(map);

          setTimeout(() => {
            const btn = document.querySelector(
              `.ev-popup-cta[data-corridor-id="${stn.corridorId}"]`,
            ) as HTMLElement | null;
            btn?.addEventListener("click", () => {
              onSelectRef.current(stn.corridorId);
              popup.remove();
            });
          }, 0);

          popupRef.current = popup;
        };

        el.addEventListener("click", (ev) => {
          ev.stopPropagation();
          openPopup();
        });
        el.addEventListener("keydown", (ev) => {
          if (
            (ev as KeyboardEvent).key === "Enter" ||
            (ev as KeyboardEvent).key === " "
          ) {
            ev.preventDefault();
            openPopup();
          }
        });

        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat(stn.coords)
          .addTo(map);
        markersRef.current.push(marker);

        const parent = CORRIDORS.find((c) => c.id === stn.corridorId);
        evMarkersRef.current.push({
          marker,
          level: parent ? parent.level : "moderate",
        });
        /* respect the EV-layer toggle from the very first render */
        if (!showEvRef.current) el.style.display = "none";
      });

      setReady(true);
      onReady?.(
        () => mapRef.current?.zoomIn({ duration: 280 }),
        () => mapRef.current?.zoomOut({ duration: 280 }),
      );
    });

    mapRef.current = map;
    return () => {
      if (animRafRef.current !== null) cancelAnimationFrame(animRafRef.current);
      animRafRef.current = null;
      popupRef.current?.remove();
      popupRef.current = null;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      cityMarkersRef.current = [];
      subMarkersRef.current = [];
      evMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* When the active corridor changes — update paint expressions and fly to it */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    map.setPaintProperty("corridors-line", "line-width", [
      "case",
      ["==", ["get", "id"], activeId],
      5.5,
      ["boolean", ["feature-state", "hover"], false],
      4.5,
      3,
    ]);
    map.setPaintProperty("corridors-glow", "line-width", [
      "case",
      ["==", ["get", "id"], activeId],
      16,
      ["boolean", ["feature-state", "hover"], false],
      12,
      8,
    ]);
    if (map.getLayer("corridors-flow")) {
      map.setPaintProperty("corridors-flow", "line-width", [
        "case",
        ["==", ["get", "id"], activeId],
        2.6,
        1.6,
      ]);
    }

    const c = CORRIDORS.find((x) => x.id === activeId);
    if (c) {
      const midLng = (c.from.coords[0] + c.to.coords[0]) / 2;
      const midLat = (c.from.coords[1] + c.to.coords[1]) / 2;
      map.flyTo({
        center: [midLng, midLat],
        zoom: 7.6,
        speed: 0.9,
        curve: 1.4,
        essential: true,
      });
    }
  }, [activeId, ready]);

  /* When the level filter changes — hide/show layers and markers */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const visibleLevels = Array.from(levelFilter);

    /* Each corridor line/glow/hit/flow layer filtered by `level` property */
    const filterExpr: any = [
      "in",
      ["get", "level"],
      ["literal", visibleLevels],
    ];
    [
      "corridors-line",
      "corridors-glow",
      "corridors-hit",
      "corridors-flow",
    ].forEach((id) => {
      if (map.getLayer(id)) map.setFilter(id, filterExpr);
    });

    /* DOM markers — set display by checking each marker's level */
    cityMarkersRef.current.forEach(({ marker, level }) => {
      const visible = levelFilter.has(level);
      marker.getElement().style.display = visible ? "" : "none";
    });
    subMarkersRef.current.forEach(({ marker, level }) => {
      const visible = levelFilter.has(level);
      marker.getElement().style.display = visible ? "" : "none";
    });
    /* EV markers obey BOTH the level filter and the EV-layer toggle */
    evMarkersRef.current.forEach(({ marker, level }) => {
      const visible = levelFilter.has(level) && showEv;
      marker.getElement().style.display = visible ? "" : "none";
    });

    /* If an open popup belongs to a hidden corridor, dismiss it */
    if (popupRef.current && !visibleLevels.length) {
      popupRef.current.remove();
      popupRef.current = null;
    }
  }, [levelFilter, showEv, ready]);

  return (
    <div ref={containerRef} className="gridmap" aria-label="Ontario grid map" />
  );
}

/* ─────────────────────────────────────────────
   FORECAST SIMULATOR  (5-year stress projection)

   A transparent, deterministic model: the corridor's
   current stress index is pushed forward month-by-month
   under four adjustable drivers. EV adoption is the
   dominant upward force; grid investment is the main
   mitigation. Everything recomputes live as the operator
   drags a slider or scrubs the 60-month timeline.
   ───────────────────────────────────────────── */

interface SimVars {
  evAdoption: number; // annual EV fleet growth, 0.05–0.50
  chargingLoad: number; // fast-charge (DCFC) intensity, 0–1
  gridInvestment: number; // capital upgrade pace (mitigation), 0–1
  weatherSeverity: number; // climate / extreme-weather pressure, 0–1
}

const SIM_DEFAULTS: SimVars = {
  evAdoption: 0.22,
  chargingLoad: 0.45,
  gridInvestment: 0.3,
  weatherSeverity: 0.4,
};

const HORIZON_MONTHS = 60; // 5 years
const SIM_BASE_DATE = new Date(2025, 6, 1); // Jul 2025 — matches lastUpdated

/** Map a projected stress index to a severity level for colouring. */
function levelFor(stress: number): Level {
  return stress >= 80
    ? "critical"
    : stress >= 65
      ? "high"
      : stress >= 45
        ? "moderate"
        : "low";
}

/** Deterministic projection for a corridor at a given month under given vars. */
function projectAt(c: Corridor, v: SimVars, month: number) {
  const yrs = month / 12;
  /* annual change in index points — can be negative if investment wins */
  const annualDelta =
    v.evAdoption * 34 + // dominant driver
    v.chargingLoad * 11 + // peak intensity
    v.weatherSeverity * 8 +
    4 - // base demand creep
    v.gridInvestment * 27; // mitigation
  /* mild early acceleration, capped at 100 */
  const curve = 1 + 0.06 * yrs;
  const rawStress = c.stressIndex + annualDelta * yrs * curve;
  const stress = Math.max(2, Math.min(100, rawStress));

  /* affected customers grow with adoption + extra exposure once stress is high */
  const custGrowth = v.evAdoption * 0.9 + 0.02;
  const base = c.customers * (1 + custGrowth * yrs);
  const exposure = 1 + Math.max(0, (stress - 70) / 100) * 0.7;
  const customers = Math.round(base * exposure);

  const outage = Math.max(
    0,
    Math.min(95, c.outageRisk + (stress - c.stressIndex) * 0.45),
  );
  const infra = Math.round(
    c.infraAtRisk * (1 + Math.max(0, (stress - c.stressIndex) / 100) * 1.4),
  );

  return { stress, customers, outage, infra };
}

/** Factor mix — % each driver contributes to the projected pressure. */
function factorMix(
  v: SimVars,
): { label: string; pct: number; tone: FactorTone }[] {
  const ev = v.evAdoption * 34;
  const charge = v.chargingLoad * 11;
  const weather = v.weatherSeverity * 8;
  const base = 4;
  const total = ev + charge + weather + base || 1;
  const raw = [
    { label: "EV Charging Load", v: ev, tone: "critical" as FactorTone },
    { label: "Fast-Charge Peaks", v: charge, tone: "high" as FactorTone },
    { label: "Weather Exposure", v: weather, tone: "moderate" as FactorTone },
    { label: "Base Demand", v: base, tone: "low" as FactorTone },
  ];
  return raw.map((r) => ({
    label: r.label,
    pct: Math.round((r.v / total) * 100),
    tone: r.tone,
  }));
}

const monthToLabel = (m: number) => {
  const d = new Date(
    SIM_BASE_DATE.getFullYear(),
    SIM_BASE_DATE.getMonth() + m,
    1,
  );
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
};

/* ── Projection chart (stress index across 60 months, with band + marker) ── */
function ForecastChart({
  c,
  vars,
  month,
}: {
  c: Corridor;
  vars: SimVars;
  month: number;
}) {
  const w = 480,
    h = 210;
  const padL = 30,
    padR = 16,
    padT = 16,
    padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const toY = (s: number) => padT + innerH - (s / 100) * innerH;
  const toX = (m: number) => padL + (m / HORIZON_MONTHS) * innerW;

  const pts = Array.from({ length: HORIZON_MONTHS + 1 }, (_, m) => {
    const { stress } = projectAt(c, vars, m);
    return { m, x: toX(m), y: toY(stress), stress };
  });

  /* uncertainty band widens with time (±, up to ~12 index pts) */
  const band = pts.map((p) => {
    const spread = (p.m / HORIZON_MONTHS) * 12;
    return {
      x: p.x,
      up: toY(Math.min(100, p.stress + spread)),
      dn: toY(Math.max(0, p.stress - spread)),
    };
  });
  const bandPath =
    band.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.up}`).join(" ") +
    " " +
    band
      .slice()
      .reverse()
      .map((p) => `L ${p.x} ${p.dn}`)
      .join(" ") +
    " Z";

  const linePath = pts
    .map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`)
    .join(" ");
  const sel = pts[month];
  const gradId = `simgrad-${c.id}`;
  const startCol = levelColor[levelFor(pts[0].stress)];
  const endCol = levelColor[levelFor(pts[pts.length - 1].stress)];
  const baseY = toY(c.stressIndex);

  const xTicks = [
    { m: 0, label: "Now" },
    { m: 18, label: "18 mo" },
    { m: 36, label: "3 yr" },
    { m: 60, label: "5 yr" },
  ];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="sim-chart">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={startCol} />
          <stop offset="100%" stopColor={endCol} />
        </linearGradient>
      </defs>

      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line
            x1={padL}
            y1={toY(g)}
            x2={w - padR}
            y2={toY(g)}
            className="sim-chart-grid"
          />
          <text x={padL - 5} y={toY(g) + 3} className="sim-chart-axis">
            {g}
          </text>
        </g>
      ))}

      {/* today reference line */}
      <line
        x1={padL}
        y1={baseY}
        x2={w - padR}
        y2={baseY}
        className="sim-chart-baseline"
      />
      <text x={w - padR} y={baseY - 4} className="sim-chart-baselabel">
        today
      </text>

      {/* uncertainty band + projection line */}
      <path d={bandPath} className="sim-chart-band" fill={`url(#${gradId})`} />
      <path
        d={linePath}
        className="sim-chart-line"
        stroke={`url(#${gradId})`}
      />

      {/* selected-month marker */}
      <line
        x1={sel.x}
        y1={padT}
        x2={sel.x}
        y2={padT + innerH}
        className="sim-chart-marker"
      />
      <circle
        cx={sel.x}
        cy={sel.y}
        r="3.4"
        fill={levelColor[levelFor(sel.stress)]}
        stroke="#0a0a0c"
        strokeWidth="1.5"
      />

      {xTicks.map((t) => (
        <text key={t.m} x={toX(t.m)} y={h - 6} className="sim-chart-axis-x">
          {t.label}
        </text>
      ))}
    </svg>
  );
}

/* ── A labelled range control ── */
function SimSlider({
  label,
  value,
  min,
  max,
  step,
  display,
  hint,
  accent,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  hint: string;
  accent: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="sim-slider">
      <div className="sim-slider-top">
        <span className="sim-slider-label">{label}</span>
        <span className="sim-slider-val" style={{ color: accent }}>
          {display}
        </span>
      </div>
      <input
        type="range"
        className="sim-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={
          {
            ["--fill"]: `${pct}%`,
            ["--accent"]: accent,
          } as Record<string, string>
        }
        aria-label={label}
      />
      <span className="sim-slider-hint">{hint}</span>
    </div>
  );
}

function ForecastSimulator({
  corridor,
  open,
  onClose,
}: {
  corridor: Corridor;
  open: boolean;
  onClose: () => void;
}) {
  const [vars, setVars] = useState<SimVars>(SIM_DEFAULTS);
  const [month, setMonth] = useState(18);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const set = useCallback(
    (k: keyof SimVars) => (val: number) => setVars((p) => ({ ...p, [k]: val })),
    [],
  );

  const proj = projectAt(corridor, vars, month);
  const mix = factorMix(vars);
  const lvl = levelFor(proj.stress);
  const col = levelColor[lvl];
  const deltaPct = Math.round(
    ((proj.stress - corridor.stressIndex) / corridor.stressIndex) * 100,
  );
  const custDelta = proj.customers - corridor.customers;
  const rising = proj.stress >= corridor.stressIndex;
  const arrow = rising ? "↑" : "↓";

  return (
    <div
      className={`sim-overlay ${open ? "is-open" : ""}`}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
      aria-label="Forecast simulator"
    >
      <div className="sim-backdrop" onClick={onClose} />

      <div className="sim-panel">
        {/* header */}
        <div className="sim-header">
          <div className="sim-header-l">
            <span className="sim-eyebrow">5-YEAR STRESS FORECAST</span>
            <h2 className="sim-title">
              {corridor.name}
              <span
                className="sim-title-level"
                style={{ color: col, borderColor: col }}
              >
                {lvl.toUpperCase()}
              </span>
            </h2>
          </div>
          <button
            type="button"
            className="sim-close"
            aria-label="Close simulator"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden>
              <path
                d="M6 6 L18 18 M18 6 L6 18"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="sim-body">
          {/* CONTROLS */}
          <div className="sim-col sim-col-controls">
            <span className="sim-col-title">DRIVERS</span>
            <SimSlider
              label="EV Adoption"
              value={vars.evAdoption}
              min={0.05}
              max={0.5}
              step={0.01}
              display={`${Math.round(vars.evAdoption * 100)}%/yr`}
              hint="Annual EV fleet growth"
              accent="#FF4D4D"
              onChange={set("evAdoption")}
            />
            <SimSlider
              label="Fast-Charge Load"
              value={vars.chargingLoad}
              min={0}
              max={1}
              step={0.01}
              display={`${Math.round(vars.chargingLoad * 100)}%`}
              hint="Share of DCFC / peak intensity"
              accent="#FF8A3D"
              onChange={set("chargingLoad")}
            />
            <SimSlider
              label="Grid Investment"
              value={vars.gridInvestment}
              min={0}
              max={1}
              step={0.01}
              display={`${Math.round(vars.gridInvestment * 100)}%`}
              hint="Capital upgrade pace (mitigation)"
              accent="#4ADE80"
              onChange={set("gridInvestment")}
            />
            <SimSlider
              label="Weather Severity"
              value={vars.weatherSeverity}
              min={0}
              max={1}
              step={0.01}
              display={`${Math.round(vars.weatherSeverity * 100)}%`}
              hint="Climate / extreme-weather pressure"
              accent="#F4C040"
              onChange={set("weatherSeverity")}
            />
            <button
              type="button"
              className="sim-reset"
              onClick={() => setVars(SIM_DEFAULTS)}
            >
              Reset to baseline
            </button>
          </div>

          {/* CHART */}
          <div className="sim-col sim-col-chart">
            <div className="sim-chart-readout">
              <span className="sim-chart-readout-lbl">
                PROJECTED STRESS INDEX
              </span>
              <span className="sim-chart-readout-when">
                {monthToLabel(month)}
              </span>
            </div>
            <ForecastChart c={corridor} vars={vars} month={month} />
          </div>

          {/* OUTPUTS */}
          <div className="sim-col sim-col-outputs">
            <span className="sim-col-title">AT {monthToLabel(month)}</span>

            <div className="sim-out-card">
              <span className="sim-out-lbl">STRESS INDEX</span>
              <span className="sim-out-big" style={{ color: col }}>
                {Math.round(proj.stress)}
              </span>
              <span className="sim-out-delta" style={{ color: col }}>
                {arrow} {Math.abs(deltaPct)}% vs today ({corridor.stressIndex})
              </span>
            </div>

            <div className="sim-out-card">
              <span className="sim-out-lbl">AFFECTED CUSTOMERS</span>
              <span className="sim-out-mid">{fmt(proj.customers)}</span>
              <span className="sim-out-delta" style={{ color: col }}>
                {custDelta >= 0 ? "↑" : "↓"} {fmt(Math.abs(custDelta))} vs today
              </span>
            </div>

            <div className="sim-out-mini-row">
              <div className="sim-out-mini">
                <span className="sim-out-lbl">PEAK OUTAGE RISK</span>
                <span className="sim-out-mid" style={{ color: col }}>
                  {Math.round(proj.outage)}%
                </span>
              </div>
              <div className="sim-out-mini">
                <span className="sim-out-lbl">INFRA AT RISK</span>
                <span className="sim-out-mid">{fmt(proj.infra)}</span>
              </div>
            </div>

            <div className="sim-mix">
              <span className="sim-out-lbl">% OF STRESS INDEX BY DRIVER</span>
              <ul className="sim-mix-list">
                {mix.map((f) => (
                  <li key={f.label} className="sim-mix-row">
                    <span className="sim-mix-label">{f.label}</span>
                    <div className="sim-mix-bar-wrap">
                      <div
                        className="sim-mix-bar"
                        style={{
                          width: `${f.pct}%`,
                          background: factorColor[f.tone],
                        }}
                      />
                    </div>
                    <span className="sim-mix-pct">{f.pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* TIME SCRUBBER */}
        <div className="sim-time">
          <div className="sim-time-head">
            <span className="sim-time-lbl">TIMELINE</span>
            <span className="sim-time-readout" style={{ color: col }}>
              Month {month} · {monthToLabel(month)}
            </span>
          </div>
          <input
            type="range"
            className="sim-time-range"
            min={0}
            max={HORIZON_MONTHS}
            step={1}
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            style={
              {
                ["--fill"]: `${(month / HORIZON_MONTHS) * 100}%`,
                ["--accent"]: col,
              } as Record<string, string>
            }
            aria-label="Forecast month"
          />
          <div className="sim-time-ticks">
            <span>Now</span>
            <span>18 mo</span>
            <span>3 yr</span>
            <span>5 yr</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────── */

export default function PlatformPage() {
  const [exploring, setExploring] = useState(false);
  const [activeId, setActiveId] = useState<string>("toronto-oshawa");
  const [levelFilter, setLevelFilter] = useState<Set<Level>>(
    () => new Set<Level>(["critical", "high", "moderate", "low"]),
  );
  const [showEv, setShowEv] = useState(true);
  const [simOpen, setSimOpen] = useState(false);
  const data = CORRIDORS.find((c) => c.id === activeId)!;
  const color = levelColor[data.level];
  const evOutlook = getEvOutlook(data);

  /** Toggle one severity in/out of the filter set */
  const toggleLevel = useCallback((lvl: Level) => {
    setLevelFilter((prev) => {
      const next = new Set(prev);
      if (next.has(lvl)) {
        /* never let user fully empty the set — at least one stays visible */
        if (next.size > 1) next.delete(lvl);
      } else {
        next.add(lvl);
      }
      return next;
    });
  }, []);

  const resetFilter = useCallback(() => {
    setLevelFilter(new Set<Level>(["critical", "high", "moderate", "low"]));
  }, []);

  const allVisible = levelFilter.size === 4;

  const handleSelect = useCallback((id: string) => setActiveId(id), []);

  const zoomInFn = useRef<() => void>(() => {});
  const zoomOutFn = useRef<() => void>(() => {});

  const handleMapReady = useCallback((zIn: () => void, zOut: () => void) => {
    zoomInFn.current = zIn;
    zoomOutFn.current = zOut;
  }, []);

  /* ── ESC closes explore mode ── */
  useEffect(() => {
    if (!exploring) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExploring(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exploring]);

  return (
    <main
      className={`platform-page ${exploring ? "is-exploring" : "is-intro"}`}
    >
      {/* ── FULL-SCREEN MAP (always present, always behind) ── */}
      <div className="map-layer">
        <GridMap
          activeId={activeId}
          onSelect={handleSelect}
          levelFilter={levelFilter}
          showEv={showEv}
          onReady={handleMapReady}
        />
        <div className="map-vignette" aria-hidden />
        <div className="map-scrim" aria-hidden />
      </div>

      {/* Zoom controls — only visible in explore mode */}
      {exploring && (
        <div className="map-zoom-controls">
          <button
            type="button"
            className="map-zoom-btn"
            aria-label="Zoom in"
            onClick={() => zoomInFn.current()}
          >
            <svg
              viewBox="0 0 18 18"
              width="16"
              height="16"
              fill="none"
              aria-hidden
            >
              <line
                x1="9"
                y1="3"
                x2="9"
                y2="15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="3"
                y1="9"
                x2="15"
                y2="9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="map-zoom-sep" />
          <button
            type="button"
            className="map-zoom-btn"
            aria-label="Zoom out"
            onClick={() => zoomOutFn.current()}
          >
            <svg
              viewBox="0 0 18 18"
              width="16"
              height="16"
              fill="none"
              aria-hidden
            >
              <line
                x1="3"
                y1="9"
                x2="15"
                y2="9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}

      {/* ── TOP BAR (always visible) ── */}
      <header className="topbar">
        <Link href="/" className="topbar-back" aria-label="Back to home">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
            <path
              d="M15 6 L9 12 L15 18"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Home</span>
        </Link>

        <div className="topbar-logo">
          <Image
            src="/logo_zeus.png"
            alt="ZEUS"
            width={72}
            height={22}
            priority
            className="topbar-logo-img"
          />
        </div>

        <div className="topbar-status">
          <span className="topbar-pulse" />
          <span className="topbar-status-text">LIVE</span>
          <span className="topbar-status-sub">{data.lastUpdated}</span>
        </div>
      </header>

      {/* ── LEVEL FILTER CHIPS (visible in explore mode) ── */}
      <div className="filter-row" aria-hidden={!exploring}>
        <button
          type="button"
          className={`filter-chip filter-chip-all ${allVisible ? "is-active" : ""}`}
          onClick={resetFilter}
          aria-pressed={allVisible}
        >
          ALL
          <span className="filter-chip-count">{CORRIDORS.length}</span>
        </button>

        <span className="filter-row-sep" aria-hidden />

        {(["critical", "high", "moderate", "low"] as Level[]).map((lvl) => {
          const active = levelFilter.has(lvl);
          const count = CORRIDORS.filter((c) => c.level === lvl).length;
          return (
            <button
              key={lvl}
              type="button"
              className={`filter-chip filter-chip-${lvl} ${active ? "is-active" : ""}`}
              onClick={() => toggleLevel(lvl)}
              aria-pressed={active}
              style={
                { ["--chip-color" as string]: levelColor[lvl] } as Record<
                  string,
                  string
                >
              }
            >
              <span className="filter-chip-dot" />
              {lvl.toUpperCase()}
              <span className="filter-chip-count">{count}</span>
            </button>
          );
        })}

        <span className="filter-row-sep" aria-hidden />

        <button
          type="button"
          className={`filter-chip filter-chip-ev ${showEv ? "is-active" : ""}`}
          onClick={() => setShowEv((v) => !v)}
          aria-pressed={showEv}
        >
          <span className="filter-chip-bolt" aria-hidden>
            <svg viewBox="0 0 24 24" width="11" height="11">
              <path
                d="M13 2 L5 13 L11 13 L10 22 L19 10 L13 10 Z"
                fill="currentColor"
              />
            </svg>
          </span>
          EV SITES
          <span className="filter-chip-count">{EV_STATIONS.length}</span>
        </button>
      </div>

      {/* ── INTRO OVERLAY (hero state) ── */}
      <section className="intro" aria-hidden={exploring}>
        <div className="intro-inner">
          <div className="intro-badge">
            <span className="intro-badge-dot" />
            Live Grid Intelligence
          </div>

          <h1 className="intro-title">
            The grid, <span className="intro-title-accent">interactively</span>
            <br />
            mapped in real time.
          </h1>

          <p className="intro-sub">
            Select any corridor across Ontario to see live grid-stress
            diagnostics alongside EV charging demand and feeder headroom — so
            you can read where electric-vehicle growth is outpacing the grid,
            and where there&apos;s room to build.
          </p>

          <div className="intro-actions">
            <button
              type="button"
              className="intro-cta"
              onClick={() => setExploring(true)}
            >
              <span className="intro-cta-label">Explore the Grid</span>
              <span className="intro-cta-arrow" aria-hidden>
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path
                    d="M5 12 L19 12 M13 6 L19 12 L13 18"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            <a href="#docs" className="intro-secondary">
              How it works
            </a>
          </div>

          {/* tiny preview KPIs */}
          <div className="intro-stats">
            <div className="intro-stat">
              <span className="intro-stat-val">{EV_STATIONS.length}</span>
              <span className="intro-stat-lbl">EV sites mapped</span>
            </div>
            <div className="intro-stat-sep" />
            <div className="intro-stat">
              <span className="intro-stat-val">39,335</span>
              <span className="intro-stat-lbl">Grid assets tracked</span>
            </div>
            <div className="intro-stat-sep" />
            <div className="intro-stat">
              <span className="intro-stat-val">10s</span>
              <span className="intro-stat-lbl">Refresh interval</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── DASHBOARD OVERLAYS (explore state) ── */}

      {/* LEFT PANEL */}
      <aside className="panel panel-left" aria-hidden={!exploring}>
        <div className="panel-head">
          <h2 className="panel-h2">STRESS INDEX</h2>
          <p className="panel-desc">
            Real-time condition and risk of Ontario&apos;s energy transmission
            and distribution infrastructure.
          </p>
          <button
            type="button"
            className="panel-sim-cta"
            onClick={() => setSimOpen(true)}
            style={{ ["--cta" as string]: color } as Record<string, string>}
          >
            <span className="panel-sim-cta-bolt" aria-hidden>
              <svg viewBox="0 0 24 24" width="13" height="13">
                <path
                  d="M4 13 H10 L9 21 L20 9 H14 L15 3 Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Run 5-year forecast
            <span className="panel-sim-cta-arrow" aria-hidden>
              →
            </span>
          </button>
        </div>

        <div className="metric-card">
          <div className="metric-label">PROVINCIAL STRESS INDEX</div>
          <div className="metric-row">
            <div className="metric-main">
              <span className="metric-value" style={{ color }}>
                {data.stressIndex}
              </span>
              <span className="metric-status" style={{ color }}>
                {data.level.toUpperCase()}
              </span>
            </div>
            <Sparkline data={data.trend} color={color} />
          </div>
          <div className="metric-delta">
            <span className="delta-up" style={{ color }}>
              ↑ {data.delta}
            </span>
            <span className="delta-text">vs yesterday</span>
          </div>
          <div className="scale">
            <div className="scale-bar" />
            <div className="scale-labels">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">AFFECTED CUSTOMERS</div>
          <div className="metric-row">
            <span className="metric-value-lg">{fmt(data.customers)}</span>
            <svg viewBox="0 0 24 24" className="metric-icon" aria-hidden>
              <circle
                cx="9"
                cy="8"
                r="3.2"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
              />
              <circle
                cx="16"
                cy="9"
                r="2.4"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
              />
              <path
                d="M3.5 18c0-2.8 2.5-4.8 5.5-4.8s5.5 2 5.5 4.8"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
              />
              <path
                d="M14 18c0-2.2 1.7-3.8 4-3.8s4 1.6 4 3.8"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
              />
            </svg>
          </div>
          <div className="metric-delta">
            <span className="delta-up" style={{ color }}>
              ↑ {fmt(data.customersDelta)}
            </span>
            <span className="delta-text">vs yesterday</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">
            PREDICTED OUTAGE RISK <span className="metric-sublabel">(24H)</span>
          </div>
          <div className="metric-row">
            <span className="metric-value-lg" style={{ color }}>
              {data.outageRisk}%
            </span>
            <MiniDonut value={data.outageRisk} color={color} />
          </div>
          <div className="metric-delta">
            <span className="delta-up" style={{ color }}>
              ↑ {data.outageRiskDelta}%
            </span>
            <span className="delta-text">vs yesterday</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">INFRASTRUCTURE AT RISK</div>
          <div className="metric-row">
            <span className="metric-value-lg" style={{ color }}>
              {data.infraAtRisk}
            </span>
            <svg viewBox="0 0 24 24" className="metric-icon" aria-hidden>
              <path
                d="M12 2 L8 8 L10 8 L8 14 L10 14 L7 22 M12 2 L16 8 L14 8 L16 14 L14 14 L17 22 M9 14 L15 14"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="metric-delta">
            <span className="delta-up" style={{ color }}>
              ↑ {data.infraDelta}
            </span>
            <span className="delta-text">vs yesterday</span>
          </div>
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <aside className="panel panel-right" aria-hidden={!exploring}>
        <div className="metric-card">
          <div className="card-head">
            <span className="card-title">HIGH RISK CORRIDORS</span>
          </div>
          <div className="corridor-list-header">
            <span>CORRIDOR</span>
            <span>STRESS INDEX</span>
          </div>
          <ul className="corridor-list">
            {CORRIDORS.map((c) => (
              <li
                key={c.id}
                className={`corridor-row ${c.id === activeId ? "corridor-row-active" : ""}`}
                onClick={() => setActiveId(c.id)}
              >
                <span className="corridor-row-name">
                  <span
                    className="corridor-dot"
                    style={{ background: levelColor[c.level] }}
                  />
                  {c.name}
                </span>
                <span
                  className="corridor-row-index"
                  style={{ color: levelColor[c.level] }}
                >
                  {c.stressIndex}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="metric-card">
          <div className="card-head">
            <span className="card-title">
              STRESS INDEX TREND <span className="card-title-sub">(7D)</span>
            </span>
          </div>
          <TrendChart data={data.trend} color={color} />
        </div>

        <div className="metric-card">
          <div className="card-head">
            <span className="card-title">TOP STRESS FACTORS</span>
          </div>
          <ul className="factor-list">
            {data.factors.map((f) => (
              <li key={f.label} className="factor-row">
                <span className="factor-label">{f.label}</span>
                <div className="factor-bar-wrap">
                  <div
                    className="factor-bar"
                    style={{
                      width: `${f.pct * 2}px`,
                      background: factorColor[f.tone],
                    }}
                  />
                </div>
                <span className="factor-pct">{f.pct}%</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="metric-card ev-outlook">
          <div className="card-head ev-outlook-head">
            <span className="card-title">
              EV GROWTH OUTLOOK{" "}
              <span className="card-title-sub">({evOutlook.sites} SITES)</span>
            </span>
            <span
              className="ev-verdict"
              style={{
                color: factorColor[evOutlook.verdictTone],
                borderColor: factorColor[evOutlook.verdictTone],
              }}
            >
              {evOutlook.verdict}
            </span>
          </div>

          <p className="ev-outlook-summary">{evOutlook.summary}</p>

          <ul className="ev-signal-list">
            {evOutlook.signals.map((s) => (
              <li key={s.label} className="ev-signal-row">
                <span
                  className="ev-signal-tick"
                  style={{ background: factorColor[s.tone] }}
                  aria-hidden
                />
                <span className="ev-signal-label">{s.label}</span>
                <span
                  className="ev-signal-value"
                  style={{ color: factorColor[s.tone] }}
                >
                  {s.value}
                </span>
              </li>
            ))}
          </ul>

          <div className="ev-outlook-foot">
            <span className="ev-outlook-foot-lbl">
              Usage × grid headroom · live read
            </span>
          </div>
        </div>
      </aside>

      {/* SELECTED CORRIDOR PILL (floats above bottom strip) */}
      <div className="selected-pill" aria-hidden={!exploring}>
        <span className="selected-pill-tag">SELECTED</span>
        <span className="selected-pill-name" style={{ color }}>
          {data.name}
        </span>
        <span className="selected-pill-status">
          {data.level.toUpperCase()} · {data.stressIndex}
        </span>
        <button
          type="button"
          className="selected-pill-sim"
          onClick={() => setSimOpen(true)}
          style={{ color }}
        >
          <span className="selected-pill-sim-bolt" aria-hidden>
            <svg viewBox="0 0 24 24" width="12" height="12">
              <path
                d="M4 13 H10 L9 21 L20 9 H14 L15 3 Z"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          5-YR FORECAST
        </button>
      </div>

      {/* FORECAST SIMULATOR (modal overlay for the active corridor) */}
      <ForecastSimulator
        corridor={data}
        open={simOpen}
        onClose={() => setSimOpen(false)}
      />

      {/* BOTTOM STATS STRIP */}
      <div className="bottom-strip" aria-hidden={!exploring}>
        <div className="bottom-stat">
          <div className="bottom-icon">
            <svg viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="7"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
              />
              <circle
                cx="12"
                cy="12"
                r="2.2"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
              />
            </svg>
          </div>
          <div className="bottom-content">
            <span className="bottom-label">TOTAL MONITORED ASSETS</span>
            <span className="bottom-value">{fmt(data.bottom.monitored)}</span>
            <span className="bottom-delta delta-up" style={{ color }}>
              ↑ {data.bottom.monitoredDelta}%
            </span>
          </div>
        </div>

        <div className="bottom-stat">
          <div className="bottom-icon">
            <svg viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="8"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
              />
              <path
                d="M9 12 L11 14 L15 10"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="bottom-content">
            <span className="bottom-label">ONLINE ASSETS</span>
            <span className="bottom-value">{fmt(data.bottom.online)}</span>
            <span className="bottom-delta delta-good">
              {data.bottom.onlinePct}%
            </span>
          </div>
        </div>

        <div className="bottom-stat">
          <div className="bottom-icon">
            <svg viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="8"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
              />
              <path
                d="M9 9 L15 15 M15 9 L9 15"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="bottom-content">
            <span className="bottom-label">OUT OF SERVICE</span>
            <span className="bottom-value">
              {fmt(data.bottom.outOfService)}
            </span>
            <span className="bottom-delta delta-bad">
              ↑ {data.bottom.outDelta}%
            </span>
          </div>
        </div>

        <div className="bottom-stat">
          <div className="bottom-icon">
            <svg viewBox="0 0 24 24">
              <path
                d="M6 16 a4 4 0 1 1 1 -7.9 a5 5 0 0 1 9.8 1.4 a3.5 3.5 0 0 1 -1 6.8 Z"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
                strokeLinejoin="round"
              />
              <path
                d="M9 19 L9 21 M12 19 L12 22 M15 19 L15 21"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="bottom-content">
            <span className="bottom-label">WEATHER IMPACT</span>
            <span
              className="bottom-value"
              style={{ color: levelColor[data.bottom.weatherTone] }}
            >
              {data.bottom.weather}
            </span>
            <span className="bottom-delta">Risk</span>
          </div>
        </div>

        <div className="bottom-stat">
          <div className="bottom-icon">
            <svg viewBox="0 0 24 24">
              <path
                d="M4 16 a8 8 0 0 1 16 0"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
              />
              <path
                d="M12 16 L17 9"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="16" r="1.4" fill="currentColor" />
            </svg>
          </div>
          <div className="bottom-content">
            <span className="bottom-label">
              LOAD FORECAST <span className="bottom-sublabel">(PEAK)</span>
            </span>
            <span className="bottom-value">
              {fmt(data.bottom.loadMw)} <span className="bottom-unit">MW</span>
            </span>
            <span className="bottom-delta delta-up" style={{ color }}>
              ↑ {data.bottom.loadDelta}%
            </span>
          </div>
        </div>
      </div>

      {/* ── CAPACITY LEGEND (Toronto Hydro style — available capacity bands) ── */}
      <div className="cap-legend" aria-hidden={!exploring}>
        <div className="cap-legend-head">
          <span className="cap-legend-title">FEEDER AVAILABLE CAPACITY</span>
          <span className="cap-legend-src">Toronto Hydro + modelled</span>
        </div>
        <div className="cap-legend-row">
          {(
            ["abundant", "ample", "limited", "constrained"] as ChargerTier[]
          ).map((t) => (
            <span key={t} className="cap-legend-item">
              <span
                className="cap-legend-bolt"
                style={{ color: tierColor[t] }}
                aria-hidden
              >
                <svg viewBox="0 0 24 24" width="11" height="11">
                  <path
                    d="M13 2 L5 13 L11 13 L10 22 L19 10 L13 10 Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              {tierLabel[t]}
            </span>
          ))}
        </div>
      </div>

      {/* EXIT BUTTON (top-right while exploring) */}
      <button
        type="button"
        className="exit-btn"
        aria-hidden={!exploring}
        aria-label="Exit explore mode"
        onClick={() => setExploring(false)}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
          <path
            d="M6 6 L18 18 M18 6 L6 18"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <span>ESC</span>
      </button>
    </main>
  );
}
