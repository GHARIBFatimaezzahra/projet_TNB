/* =====================================================
   CHART.JS LOADER - CHARGEMENT DYNAMIQUE
   ===================================================== */

export function loadChartJS(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).Chart) {
      resolve((window as any).Chart);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
    script.onload = () => {
      if ((window as any).Chart) {
        resolve((window as any).Chart);
      } else {
        reject(new Error('Chart.js failed to load'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load Chart.js script'));
    };
    
    document.head.appendChild(script);
  });
}

// Déclaration globale pour TypeScript
declare global {
  interface Window {
    Chart: any;
  }
}
