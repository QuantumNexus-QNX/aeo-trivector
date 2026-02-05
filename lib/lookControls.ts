/**
 * Look Control Object - Unified aesthetic tuning without touching physics
 * 
 * All aesthetic control is applied at the end via tone mapping + gamma.
 * Physics terms (gravitational redshift, Doppler factor, emissivity) remain separate.
 */

export interface LookControls {
  // Exposure: controls overall brightness (post-physics)
  exposure: number; // default ~1.0, range 0.5-2.0
  
  // Highlight knee: prevents "white pancake" by compressing bright regions
  highlightKnee: number; // default ~0.9, range 0.7-1.5
  
  // Gamma: controls contrast and midtone brightness
  gamma: number; // default ~2.2, range 1.8-2.6
  
  // Ring bloom strength: glow intensity for photon ring
  ringBloomStrength: number; // default ~0.3, range 0.0-1.0
  
  // Ring bloom radius: how far the glow extends
  ringBloomRadius: number; // default ~0.5, range 0.0-1.0
}

export const DEFAULT_LOOK: LookControls = {
  exposure: 1.0,
  highlightKnee: 0.9,
  gamma: 2.2,
  ringBloomStrength: 0.3,
  ringBloomRadius: 0.5,
};

export const MOBILE_LOOK: LookControls = {
  exposure: 0.85,
  highlightKnee: 0.75,
  gamma: 2.0,
  ringBloomStrength: 0.25,
  ringBloomRadius: 0.4,
};

export const OBSERVATORY_LOOK: LookControls = {
  exposure: 0.95,
  highlightKnee: 0.85,
  gamma: 2.3,
  ringBloomStrength: 0.35,
  ringBloomRadius: 0.55,
};

export const DRAMATIC_LOOK: LookControls = {
  exposure: 1.2,
  highlightKnee: 1.1,
  gamma: 2.1,
  ringBloomStrength: 0.5,
  ringBloomRadius: 0.7,
};

/**
 * Get appropriate look preset based on device
 */
export function getDeviceLook(): LookControls {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  return isMobile ? MOBILE_LOOK : DEFAULT_LOOK;
}
