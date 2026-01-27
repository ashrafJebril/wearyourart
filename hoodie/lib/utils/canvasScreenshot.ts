/**
 * Utility functions for capturing screenshots from the 3D canvas
 */

export interface ScreenshotSet {
  front: string;
  back: string;
  left: string;
  right: string;
}

/**
 * Wait for a specified number of milliseconds
 */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Rotation values for each view (in radians)
 */
export const VIEW_ROTATIONS = {
  front: 0,
  back: Math.PI,
  left: -Math.PI / 2,
  right: Math.PI / 2,
} as const;

export type ViewType = keyof typeof VIEW_ROTATIONS;

/**
 * Capture a single screenshot from a canvas element
 */
export function captureCanvasScreenshot(
  canvas: HTMLCanvasElement,
  format: 'image/png' | 'image/jpeg' = 'image/png',
  quality: number = 0.92
): string {
  return canvas.toDataURL(format, quality);
}

/**
 * Capture screenshots from all 4 views of the 3D model
 *
 * @param canvas - The canvas element to capture from
 * @param setTargetRotation - Function to set the model's target rotation
 * @param waitTime - Time to wait after rotation for animation to complete (ms)
 * @returns Promise resolving to screenshot URLs for all 4 views
 */
export async function captureAllViewScreenshots(
  canvas: HTMLCanvasElement,
  setTargetRotation: (rotation: number) => void,
  waitTime: number = 500
): Promise<ScreenshotSet> {
  const screenshots: Partial<ScreenshotSet> = {};
  const views: ViewType[] = ['front', 'back', 'left', 'right'];

  for (const view of views) {
    // Set the rotation for this view
    setTargetRotation(VIEW_ROTATIONS[view]);

    // Wait for the model to rotate and render
    await wait(waitTime);

    // Capture the screenshot
    screenshots[view] = captureCanvasScreenshot(canvas);
  }

  return screenshots as ScreenshotSet;
}

/**
 * Capture screenshots with a callback for progress updates
 */
export async function captureAllViewScreenshotsWithProgress(
  canvas: HTMLCanvasElement,
  setTargetRotation: (rotation: number) => void,
  onProgress?: (view: ViewType, index: number, total: number) => void,
  waitTime: number = 500
): Promise<ScreenshotSet> {
  const screenshots: Partial<ScreenshotSet> = {};
  const views: ViewType[] = ['front', 'back', 'left', 'right'];

  for (let i = 0; i < views.length; i++) {
    const view = views[i];

    // Report progress
    if (onProgress) {
      onProgress(view, i + 1, views.length);
    }

    // Set the rotation for this view
    setTargetRotation(VIEW_ROTATIONS[view]);

    // Wait for the model to rotate and render
    await wait(waitTime);

    // Capture the screenshot
    screenshots[view] = captureCanvasScreenshot(canvas);
  }

  return screenshots as ScreenshotSet;
}

/**
 * Convert base64 data URL to Blob
 */
export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Estimate the size of a base64 string in bytes
 */
export function estimateBase64Size(base64: string): number {
  // Remove the data URL prefix
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  // Base64 encoding overhead is about 4/3, so actual bytes = base64Length * 3/4
  return Math.ceil((base64Data.length * 3) / 4);
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
