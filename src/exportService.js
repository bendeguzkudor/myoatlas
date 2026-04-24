/**
 * Export service for muscle strength assessments.
 * Provides JSON and PDF export with nerve-grouped layout.
 */

import { NERVE_GROUPS } from './nerveData.js';
import { STRENGTH_LEVELS, getAllRatings, getRatingStats } from './ratingSystem.js';

/**
 * Export ratings as a JSON file download.
 * @param {number} totalMuscles - Total number of ratable muscles
 * @param {Map<string, string[]>} nerveMeshMap - ratingKey → [nerveKey, ...]
 */
export function exportJSON(totalMuscles, nerveMeshMap) {
  const ratings = getAllRatings();
  const stats = getRatingStats(totalMuscles);
  const timestamp = new Date().toISOString();

  const report = {
    exportDate: timestamp,
    appVersion: 'MyoAtlas 1.0',
    summary: {
      totalMuscles: stats.total,
      rated: stats.rated,
      averageStrength: Math.round(stats.average * 100) / 100,
      distribution: stats.distribution,
    },
    ratings: {},
    attribution: {
      meshData: [
        'BodyParts3D, © The Database Center for Life Science, CC BY-SA 2.1 Japan',
        'Z-Anatomy by Gauthier Kervyn, CC BY-SA 4.0',
      ],
      nerveData: 'Nerve innervation mapping based on clinical neuromodell',
    },
  };

  // Group ratings by nerve
  for (const [ratingKey, rating] of Object.entries(ratings)) {
    const level = STRENGTH_LEVELS[rating.strength];
    const nerves = nerveMeshMap?.get(ratingKey.toLowerCase()) || [];
    report.ratings[ratingKey] = {
      strength: rating.strength,
      label: level?.label || 'Unknown',
      nerves: nerves.map(nk => NERVE_GROUPS[nk]?.label || nk),
    };
  }

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  // Open JSON in new tab
  const newWindow = window.open(url, '_blank');
  if (newWindow) {
    newWindow.document.title = `Muscle Assessment - ${new Date().toISOString().slice(0, 10)}`;
  }

  // Also trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = `muscle-assessment-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();

  // Clean up after a delay to ensure both operations complete
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Export ratings as a PDF file using jsPDF.
 * @param {number} totalMuscles
 * @param {Map<string, string[]>} ratingKeyToNerves - ratingKey → [nerveKey, ...]
 */
export async function exportPDF(totalMuscles, ratingKeyToNerves) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ format: 'a4' });
  const ratings = getAllRatings();
  const stats = getRatingStats(totalMuscles);
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // ─── Title ───
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MyoAtlas - Muscle Strength Assessment', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  y += 12;

  // ─── Summary ───
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Summary', margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Muscles Rated: ${stats.rated} / ${stats.total}`, margin, y);
  y += 5;
  doc.text(`Average Strength: ${stats.average.toFixed(2)} / 5.0`, margin, y);
  y += 5;

  // Distribution bar
  const barWidth = pageWidth - 2 * margin;
  const barHeight = 6;
  const barY = y;
  const total = Math.max(stats.rated, 1);

  let barX = margin;
  for (let level = 1; level <= 5; level++) {
    const count = stats.distribution[level] || 0;
    const segWidth = (count / total) * barWidth;
    if (segWidth > 0) {
      const c = hexToRgb(STRENGTH_LEVELS[level].color);
      doc.setFillColor(c.r, c.g, c.b);
      doc.rect(barX, barY, segWidth, barHeight, 'F');
      barX += segWidth;
    }
  }
  y += barHeight + 3;

  // Distribution legend
  doc.setFontSize(8);
  let legendX = margin;
  for (let level = 1; level <= 5; level++) {
    const def = STRENGTH_LEVELS[level];
    const c = hexToRgb(def.color);
    doc.setFillColor(c.r, c.g, c.b);
    doc.rect(legendX, y, 4, 4, 'F');
    doc.setTextColor(60);
    doc.text(`${def.label}: ${stats.distribution[level] || 0}`, legendX + 6, y + 3.5);
    legendX += 38;
  }
  y += 12;

  // ─── Ratings grouped by nerve ───
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Ratings by Nerve Innervation', margin, y);
  y += 8;

  // Build nerve → ratingKeys map
  const nerveToRatings = {};
  const unclassified = [];
  for (const [ratingKey, rating] of Object.entries(ratings)) {
    const nerves = ratingKeyToNerves?.get(ratingKey.toLowerCase()) || [];
    if (nerves.length > 0) {
      for (const nk of nerves) {
        if (!nerveToRatings[nk]) nerveToRatings[nk] = [];
        nerveToRatings[nk].push({ name: ratingKey, strength: rating.strength });
      }
    } else {
      unclassified.push({ name: ratingKey, strength: rating.strength });
    }
  }

  for (const [nerveKey, nerve] of Object.entries(NERVE_GROUPS)) {
    const items = nerveToRatings[nerveKey];
    if (!items || items.length === 0) continue;

    if (y > 260) {
      doc.addPage();
      y = margin;
    }

    // Nerve header
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const nc = hexToRgb(nerve.color);
    doc.setTextColor(nc.r, nc.g, nc.b);
    doc.text(nerve.label, margin, y);
    y += 6;

    // Muscles
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40);
    doc.setFontSize(9);
    for (const item of items) {
      if (y > 275) {
        doc.addPage();
        y = margin;
      }

      const level = STRENGTH_LEVELS[item.strength];
      const c = hexToRgb(level.color);

      // Color dot
      doc.setFillColor(c.r, c.g, c.b);
      doc.circle(margin + 2, y - 1, 1.5, 'F');

      // Muscle name and rating
      doc.text(`${item.name}`, margin + 6, y);
      doc.setTextColor(100);
      doc.text(`${level.label} (${item.strength}/5)`, margin + 80, y);
      doc.setTextColor(40);
      y += 5;
    }
    y += 4;
  }

  // Unclassified
  if (unclassified.length > 0) {
    if (y > 260) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100);
    doc.text('Other Muscles', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40);
    doc.setFontSize(9);
    for (const item of unclassified) {
      if (y > 275) {
        doc.addPage();
        y = margin;
      }
      const level = STRENGTH_LEVELS[item.strength];
      const c = hexToRgb(level.color);
      doc.setFillColor(c.r, c.g, c.b);
      doc.circle(margin + 2, y - 1, 1.5, 'F');
      doc.text(`${item.name}`, margin + 6, y);
      doc.setTextColor(100);
      doc.text(`${level.label} (${item.strength}/5)`, margin + 80, y);
      doc.setTextColor(40);
      y += 5;
    }
  }

  // ─── Attribution footer ───
  if (y > 260) {
    doc.addPage();
    y = margin;
  }
  y += 8;
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text('Mesh data: BodyParts3D (CC BY-SA 2.1 JP) + Z-Anatomy (CC BY-SA 4.0)', margin, y);
  y += 4;
  doc.text('Generated by MyoAtlas', margin, y);

  const filename = `muscle-assessment-${new Date().toISOString().slice(0, 10)}.pdf`;

  // Generate PDF as blob
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);

  // Open PDF in new tab
  window.open(url, '_blank');

  // Also trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  // Clean up after a delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };
}
