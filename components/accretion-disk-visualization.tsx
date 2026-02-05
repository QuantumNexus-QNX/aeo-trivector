'use client'

/* eslint-disable */

import { useEffect, useRef, useState } from "react"

interface AccretionDiskVisualizationProps {
  cameraZoom?: number
  viewYaw?: number
  viewPitch?: number
  hover?: number
  ringBloomStrength?: number
  shiftExponent?: number
  dopplerBlueStrength?: number
  redshiftWarmStrength?: number
}

type QualityTier = "ultra-low" | "low" | "medium" | "high" | "ultra"

function detectQualityTier(): QualityTier {
  if (typeof window === "undefined") return "medium"

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent)
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
  const isOlderAndroid = /Android [1-7]\./i.test(navigator.userAgent)

  const cores = navigator.hardwareConcurrency || 4
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4
  const screenArea = window.screen.width * window.screen.height

  if (isMobile && !isTablet) {
    if (isOlderAndroid || cores <= 2 || memory <= 1) return "ultra-low"
    if (cores <= 4 || memory <= 2) return "low"
    if (isIOS) return "medium"
    return "medium"
  }

  if (isTablet) {
    if (cores <= 2 || memory <= 2) return "low"
    if (cores <= 4 || memory <= 3) return "medium"
    return "high"
  }

  if (cores >= 8 && memory >= 8 && screenArea >= 2073600) return "ultra"
  if (cores >= 4 && memory >= 4) return "high"
  if (cores <= 2) return "low"
  return "medium"
}

function getQualitySettings(tier: QualityTier) {
  const settings = {
    "ultra-low": {
      maxSteps: 128,
      pixelRatio: 0.75,
      diskSamples: 2,
      jetEnabled: true,
      bloomEnabled: false,
      targetFPS: 30,
      adaptiveStep: 0.05,
    },
    low: {
      maxSteps: 160,
      pixelRatio: 0.85,
      diskSamples: 2,
      jetEnabled: true,
      bloomEnabled: false,
      targetFPS: 30,
      adaptiveStep: 0.045,
    },
    medium: {
      maxSteps: 192,
      pixelRatio: 0.85,
      diskSamples: 2,
      jetEnabled: true,
      bloomEnabled: false,
      targetFPS: 45,
      adaptiveStep: 0.04,
    },
    high: {
      maxSteps: 320,
      pixelRatio: 1.15,
      diskSamples: 3,
      jetEnabled: true,
      bloomEnabled: true,
      targetFPS: 60,
      adaptiveStep: 0.03,
    },
    ultra: {
      maxSteps: 450,
      pixelRatio: 1.4,
      diskSamples: 3,
      jetEnabled: true,
      bloomEnabled: true,
      targetFPS: 60,
      adaptiveStep: 0.02,
    },
  }
  return settings[tier]
}

export default function AccretionDiskVisualization(props: AccretionDiskVisualizationProps = {}) {
  const {
    cameraZoom = 1.0,
    viewYaw = 0.0,
    viewPitch = 0.0,
    hover = 0.0,
    ringBloomStrength = 0.5,
    shiftExponent = 2.8,
    dopplerBlueStrength = 1.4,
    redshiftWarmStrength = 1.5
  } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [webglError, setWebglError] = useState(false)
  const [shaderError, setShaderError] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const qualityTier = detectQualityTier()
    const quality = getQualitySettings(qualityTier)

    const isAndroid = /Android/i.test(navigator.userAgent)

    let glContext: WebGL2RenderingContext | WebGLRenderingContext | null = null
    let isWebGL2 = true

    const contextOptions: WebGLContextAttributes = {
      alpha: false,
      antialias: qualityTier === "high" || qualityTier === "ultra",
      powerPreference: qualityTier === "ultra-low" || qualityTier === "low" ? "low-power" : "high-performance",
      failIfMajorPerformanceCaveat: false,
      preserveDrawingBuffer: false,
      desynchronized: true,
    }

    try {
      glContext = canvas.getContext("webgl2", contextOptions) as WebGL2RenderingContext | null
    } catch (e) {
      console.warn("WebGL2 context creation failed, trying WebGL1")
    }

    if (!glContext) {
      isWebGL2 = false
      try {
        glContext = canvas.getContext("webgl", contextOptions) as WebGLRenderingContext | null
        if (!glContext) {
          glContext = canvas.getContext("experimental-webgl", contextOptions) as WebGLRenderingContext | null
        }
      } catch (e) {
        console.error("WebGL context creation failed")
      }
    }

    if (!glContext) {
      setWebglError(true)
      return
    }

    console.log("[v0] Device:", {
      userAgent: navigator.userAgent,
      isAndroid,
      qualityTier,
      webglVersion: isWebGL2 ? "WebGL2" : "WebGL1",
    })

    let contextLost = false
    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault()
      contextLost = true
    })

    canvas.addEventListener("webglcontextrestored", () => {
      contextLost = false
      window.location.reload()
    })

    const versionPrefix = isWebGL2 ? "#version 300 es" : ""
    const inKeyword = isWebGL2 ? "in" : "attribute"
    const outKeyword = isWebGL2 ? "out" : "varying"
    const fragInKeyword = isWebGL2 ? "in" : "varying"
    const fragOutKeyword = isWebGL2 ? "out vec4 fragColor;" : ""
    const fragColorVar = isWebGL2 ? "fragColor" : "gl_FragColor"

    const vertexShaderSource = `${versionPrefix}
      ${inKeyword} vec2 a_position;
      ${outKeyword} vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    const fragmentShaderSource = `${versionPrefix}
      precision highp float;
      precision highp int;
      
      ${fragInKeyword} vec2 v_uv;
      ${fragOutKeyword}
      
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_cameraZoom;
      uniform float u_viewYaw;
      uniform float u_viewPitch;
      uniform float u_hover;
      
      const float PI = 3.14159265359;
      const float RS = 0.6;
      const float M = RS * 0.5;  // Mass parameter (Rs = 2M)
      const float CRITICAL_B = 3.0 * sqrt(3.0) * M;  // Critical impact parameter
      const float ISCO = 6.0 * M;  // Innermost stable circular orbit
      const float DISK_INNER = ISCO * 1.05;  // Disk starts just outside ISCO
      const float DISK_OUTER = 6.0;
      const int MAX_STEPS = ${quality.maxSteps};
      const float INCLINATION = 0.1045;
      const float ADAPTIVE_STEP = ${quality.adaptiveStep.toFixed(4)};
      
      float hash(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
        p3 = p3 + dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }
      
      // Smooth turbulence using only sine waves - no grid artifacts
      float smoothTurb(vec2 p, float t) {
        float v = 0.0;
        // Layer 1 - large scale swirls
        v = v + sin(p.x * 1.2 + t * 0.7) * cos(p.y * 0.9 - t * 0.5) * 0.5;
        // Layer 2 - medium detail
        v = v + sin(p.x * 2.3 - t * 1.1 + p.y * 1.8) * 0.3;
        v = v + cos(p.y * 2.7 + t * 0.9 - p.x * 0.6) * 0.25;
        // Layer 3 - fine detail flowing
        v = v + sin(p.x * 4.1 + p.y * 3.2 + t * 1.5) * 0.15;
        v = v + cos(p.x * 3.5 - p.y * 4.0 - t * 1.3) * 0.12;
        // Layer 4 - very fine shimmer
        v = v + sin(p.x * 6.0 + t * 2.0) * cos(p.y * 5.5 - t * 1.8) * 0.08;
        return v * 0.5 + 0.5;
      }
      
      vec3 diskColor(float r, float temp) {
        // Temperature profile: T(r) ∝ r^(-3/4) (standard thin disk)
        float tempProfile = pow(DISK_INNER / max(r, DISK_INNER), 0.75);
        float t = 1.0 - tempProfile;  // 0 = hot (inner), 1 = cool (outer)
        t = clamp(t, 0.0, 1.0);
        
        // Color palette: white → pale yellow → gold → orange → amber → red-brown
        vec3 white = vec3(1.5, 1.5, 1.45);
        vec3 paleYellow = vec3(1.4, 1.35, 1.0);
        vec3 gold = vec3(1.3, 1.0, 0.5);
        vec3 orange = vec3(1.2, 0.65, 0.2);
        vec3 amber = vec3(1.0, 0.45, 0.12);
        vec3 redBrown = vec3(0.7, 0.25, 0.08);
        
        vec3 c;
        if (t < 0.2) {
          c = mix(white, paleYellow, t * 5.0);
        } else if (t < 0.4) {
          c = mix(paleYellow, gold, (t - 0.2) * 5.0);
        } else if (t < 0.6) {
          c = mix(gold, orange, (t - 0.4) * 5.0);
        } else if (t < 0.8) {
          c = mix(orange, amber, (t - 0.6) * 5.0);
        } else {
          c = mix(amber, redBrown, (t - 0.8) * 5.0);
        }
        
        return c + vec3(0.25, 0.15, 0.05) * temp;
      }
      
      // Volumetric disk sampling - samples density at any 3D point
      vec4 sampleDiskVolume(vec3 pos, vec3 vel) {
        float r = sqrt(pos.x * pos.x + pos.z * pos.z);
        float absY = abs(pos.y);
        
        // Disk thickness varies with radius - thicker at outer edge
        float diskThickness = 0.08 + 0.12 * smoothstep(DISK_INNER, DISK_OUTER, r);
        
        // Smooth vertical density falloff (no hard edges)
        float verticalDensity = exp(-absY * absY / (diskThickness * diskThickness * 2.0));
        
        if (r < DISK_INNER * 0.9 || r > DISK_OUTER * 1.1 || verticalDensity < 0.01) {
          return vec4(0.0);
        }
        
        // Radial density falloff
        float radialDensity = smoothstep(DISK_INNER * 0.9, DISK_INNER * 1.3, r) * 
                              smoothstep(DISK_OUTER * 1.1, DISK_OUTER * 0.6, r);
        
        // Time-based animation - everything flows
        float t = u_time;
        
        // Orbital motion - inner regions move faster
        float orbitalSpeed = 8.0 / (r * sqrt(r));
        float orbitalPhase = t * orbitalSpeed;
        
        // Create flowing coordinates that animate smoothly
        float flowX = pos.x * cos(orbitalPhase) - pos.z * sin(orbitalPhase);
        float flowZ = pos.x * sin(orbitalPhase) + pos.z * cos(orbitalPhase);
        
        // Multiple layers of smooth turbulence at different scales
        float turb1 = smoothTurb(vec2(flowX * 0.8, flowZ * 0.8), t * 1.5);
        float turb2 = smoothTurb(vec2(flowX * 1.5 + 5.0, flowZ * 1.2 + 3.0), t * 2.0);
        float turb3 = smoothTurb(vec2(flowX * 0.4, flowZ * 0.5), t * 0.8);
        float turbulence = turb1 * 0.5 + turb2 * 0.3 + turb3 * 0.2;
        
        // Flowing brightness variations
        float flow1 = sin(flowX * 1.5 + flowZ * 0.8 + t * 2.0) * 0.5 + 0.5;
        float flow2 = cos(flowX * 0.9 - flowZ * 1.2 - t * 1.5) * 0.5 + 0.5;
        float flowBright = flow1 * 0.4 + flow2 * 0.3 + 0.3;
        
        // === SPIRAL DENSITY WAVES (very subtle, m=2 mode) ===
        // S(r,φ,t) = 1 + A*cos(m*φ - ωt + k*ln(r))
        float angle = atan(pos.z, pos.x);
        float spiralPhase = 2.0 * angle - t * 0.8 + 2.5 * log(max(r, 0.1));
        float spiralWave = 1.0 + 0.06 * cos(spiralPhase);
        flowBright = flowBright * spiralWave;
        
        // Radial brightness - hotter near center
        float radialBright = pow(DISK_INNER / max(r, DISK_INNER), 1.5);
        
        // === PROPER RELATIVISTIC DOPPLER FROM SCHWARZSCHILD PHYSICS ===
        
        // Orbital velocity: v = sqrt(M/ρ) in geometric units, clamp < 0.7c for stability
        float vOrb = min(sqrt(RS * 0.5 / max(r, DISK_INNER)), 0.7);
        
        // Tangential velocity direction (Keplerian orbit)
        float orbitDirX = -pos.z / max(r, 0.001);
        float orbitDirZ = pos.x / max(r, 0.001);
        
        // Line of sight direction (from emitter to camera)
        float velLen = sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
        float losX = -vel.x / max(velLen, 0.001);
        float losZ = -vel.z / max(velLen, 0.001);
        
        // cos(θ) = velocity · line_of_sight
        float cosTheta = orbitDirX * losX + orbitDirZ * losZ;
        
        // Micro-shift Doppler on hover (2-4% effect for subtle interaction)
        float cosThetaShift = u_hover * 0.03;  // 3% shift on full hover
        cosTheta = cosTheta + cosThetaShift;
        
        // Lorentz factor: γ = 1/sqrt(1 - v²)
        float gamma = 1.0 / sqrt(max(1.0 - vOrb * vOrb, 0.01));
        
        // Relativistic Doppler factor: δ = 1 / [γ(1 - v·cos(θ))]
        float delta = 1.0 / max(gamma * (1.0 - vOrb * cosTheta), 0.1);
        
        // Intensity scales as δ³ (relativistic beaming)
        float dopplerBright = delta * delta * delta;
        dopplerBright = clamp(dopplerBright, 0.15, 6.0);
        
        // Combine all factors
        float density = verticalDensity * radialDensity;
        float brightness = radialBright * dopplerBright * (0.4 + turbulence * 0.4 + flowBright * 0.5);
        
        // Color based on radius and turbulence
        float tempVar = turbulence * 0.5;
        vec3 col = diskColor(r, tempVar) * brightness * 3.5;
        
        // === RELATIVISTIC COLOR SHIFT ===
        // δ > 1 = approaching (blueshift), δ < 1 = receding (redshift)
        float colorShift = clamp((delta - 1.0) * 1.5, -1.0, 1.0);
        
        // Blueshift - shift toward blue/cyan/white
        if (colorShift > 0.0) {
          float blueBoost = colorShift * colorShift;
          col.b = col.b * (1.0 + blueBoost * 3.0) + colorShift * 0.5;
          col.g = col.g * (1.0 + colorShift * 1.5);
          col.r = col.r * (1.0 - colorShift * 0.2);
        }
        // Redshift - shift toward red/orange
        else {
          float redShift = -colorShift;
          col.r = col.r * (1.0 + redShift * 0.8);
          col.g = col.g * (1.0 - redShift * 0.4);
          col.b = col.b * (1.0 - redShift * 0.8);
        }
        
        // === GRAVITATIONAL REDSHIFT (Schwarzschild) ===
        // g(ρ) = sqrt(1 - 2M/ρ) = sqrt(1 - Rs/ρ)
        float gravRedshift = sqrt(max(1.0 - RS / max(r, RS * 1.01), 0.01));
        col = col * gravRedshift;
        
        // Additional color shift from gravitational redshift
        float gravColorShift = (1.0 - gravRedshift) * 3.0;
        col.b = col.b * (1.0 - gravColorShift * 0.5);
        col.g = col.g * (1.0 - gravColorShift * 0.2);
        
        return vec4(col, density);
      }
      
      ${
        quality.jetEnabled
          ? `
      vec4 sampleJet(vec3 pos) {
        float absY = abs(pos.y);
        if (absY < 0.6 || absY > 12.0) return vec4(0.0);
        
        float r = sqrt(pos.x * pos.x + pos.z * pos.z);
        float jetRadius = 0.15 + 0.08 * sqrt(absY);
        float radialFall = exp(-r * r / (jetRadius * jetRadius * 3.0));
        
        if (radialFall < 0.02) return vec4(0.0);
        
        float core = exp(-r * r / (jetRadius * jetRadius * 0.3));
        float baseFade = smoothstep(0.6, 2.5, absY);
        float tipFade = smoothstep(12.0, 6.0, absY);
        
        float wave1 = sin(absY * 0.8 - u_time * 4.0) * 0.5 + 0.5;
        float wave2 = sin(absY * 0.4 - u_time * 2.8) * 0.5 + 0.5;
        float smoothWave = wave1 * 0.7 + wave2 * 0.3;
        
        float density = radialFall * baseFade * tipFade * (0.5 + 0.4 * smoothWave);
        
        vec3 baseColor = vec3(0.35, 0.25, 0.6);
        vec3 coreColor = vec3(0.7, 0.85, 1.0);
        vec3 color = mix(baseColor, coreColor, core * core + smoothWave * 0.2);
        
        return vec4(color, density * 0.6);
      }
      `
          : ""
      }
      
      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
        
        // Camera distance controlled by zoom (1.0 = far, 5.0+ = close for event horizon approach)
        float camDist = 11.0 / u_cameraZoom;
        float orbitAngle = u_time * 0.25 + u_viewYaw;
        
        float cI = cos(INCLINATION);
        float sI = sin(INCLINATION);
        float cO = cos(orbitAngle);
        float sO = sin(orbitAngle);
        
        float camX = sO * cI * camDist;
        float camY = sI * camDist + u_viewPitch * camDist * 0.5;
        float camZ = cO * cI * camDist;
        
        float invCamDist = 1.0 / camDist;
        float fwdX = -camX * invCamDist;
        float fwdY = -camY * invCamDist;
        float fwdZ = -camZ * invCamDist;
        
        float rightX = cO;
        float rightY = 0.0;
        float rightZ = -sO;
        
        float upX = rightY * fwdZ - rightZ * fwdY;
        float upY = rightZ * fwdX - rightX * fwdZ;
        float upZ = rightX * fwdY - rightY * fwdX;
        
        float upLen = sqrt(upX * upX + upY * upY + upZ * upZ);
        upX = upX / max(upLen, 0.001);
        upY = upY / max(upLen, 0.001);
        upZ = upZ / max(upLen, 0.001);
        
        float rdX = fwdX + uv.x * rightX + uv.y * upX;
        float rdY = fwdY + uv.x * rightY + uv.y * upY;
        float rdZ = fwdZ + uv.x * rightZ + uv.y * upZ;
        
        float rdLen = sqrt(rdX * rdX + rdY * rdY + rdZ * rdZ);
        rdX = rdX / rdLen;
        rdY = rdY / rdLen;
        rdZ = rdZ / rdLen;
        
        float posX = camX;
        float posY = camY;
        float posZ = camZ;
        float velX = rdX;
        float velY = rdY;
        float velZ = rdZ;
        
        vec3 color = vec3(0.0);
        float alpha = 0.0;
        float stepSize = ADAPTIVE_STEP;
        
        for (int i = 0; i < MAX_STEPS; i++) {
          float r = sqrt(posX * posX + posY * posY + posZ * posZ);
          
          if (r < RS) {
            color = mix(color, vec3(0.0), 1.0 - alpha);
            alpha = 1.0;
            break;
          }
          
          if (r > 30.0) {
            float starVal = hash(vec2(rdX * 400.0 + rdY * 200.0, rdZ * 300.0));
            starVal = pow(starVal, 35.0) * 0.3;
            color = color + vec3(starVal) * (1.0 - alpha);
            break;
          }
          
          float cx = posY * velZ - posZ * velY;
          float cy = posZ * velX - posX * velZ;
          float cz = posX * velY - posY * velX;
          float h2 = cx * cx + cy * cy + cz * cz;
          
          float rInv = 1.0 / r;
          float rHatX = posX * rInv;
          float rHatY = posY * rInv;
          float rHatZ = posZ * rInv;
          float accel = 1.5 * RS * h2 * rInv * rInv * rInv * rInv;
          
          velX = velX - rHatX * accel * stepSize;
          velY = velY - rHatY * accel * stepSize;
          velZ = velZ - rHatZ * accel * stepSize;
          
          float velLen = sqrt(velX * velX + velY * velY + velZ * velZ);
          velX = velX / max(velLen, 0.001);
          velY = velY / max(velLen, 0.001);
          velZ = velZ / max(velLen, 0.001);
          
          stepSize = ADAPTIVE_STEP + 0.06 * smoothstep(RS * 2.0, RS * 8.0, r);
          
          // Volumetric disk sampling at current position
          vec4 diskSample = sampleDiskVolume(vec3(posX, posY, posZ), vec3(velX, velY, velZ));
          if (diskSample.a > 0.01) {
            float contribution = diskSample.a * stepSize * 8.0 * (1.0 - alpha);
            color = color + diskSample.rgb * contribution;
            alpha = alpha + contribution * 0.5;
          }
          
          float newPosX = posX + velX * stepSize;
          float newPosY = posY + velY * stepSize;
          float newPosZ = posZ + velZ * stepSize;
          
          ${
            quality.jetEnabled
              ? `
          vec4 jetSample = sampleJet(vec3(posX, posY, posZ));
          if (jetSample.a > 0.01) {
            float a = jetSample.a * 0.008 * (1.0 - alpha);
            color = color + jetSample.rgb * a;
            alpha = alpha + a * 0.2;
          }
          `
              : ""
          }
          
          // === PHOTON RING at critical impact parameter b_c = 3√3 M ===
          // Primary photon ring - thin, sharp, hotter than disk
          float prDist = abs(r - CRITICAL_B);
          float primaryRing = exp(-prDist * prDist * 200.0);
          
          // Secondary photon ring (light that orbited once more)
          float pr2Dist = abs(r - CRITICAL_B * 0.95);
          float secondaryRing = exp(-pr2Dist * pr2Dist * 400.0) * 0.4;
          
          // === PORTAL MOMENT - slow breathing cycle for photon ring ===
          // Creates a subtle "alive" feeling - the event horizon breathes
          float portalCycle = sin(u_time * 0.4) * 0.5 + 0.5;  // Slow 15s cycle
          float portalIntensity = 0.85 + 0.25 * portalCycle;  // 0.85 to 1.1 intensity
          
          // Subtle lensing shimmer (spacetime breathing)
          float shimmer = 1.0 + 0.025 * sin(u_time * 2.5 + r * 6.0);
          
          float prPulse = 0.7 + 0.3 * sin(u_time * 3.0 + atan(posZ, posX) * 3.0);
          // Hover increases ring brightness
          float hoverBoost = 1.0 + u_hover * 0.3;
          float prGlow = (primaryRing + secondaryRing) * 0.4 * prPulse * shimmer * portalIntensity * hoverBoost * (1.0 - alpha);
          
          // Photon ring with subtle blue-white tint during portal peaks
          vec3 ringColor = mix(vec3(1.15, 1.05, 0.95), vec3(1.1, 1.15, 1.25), portalCycle * 0.3);
          
          // Optional: Subtle chromatic aberration near ring (extreme spacetime curvature)
          // Separate RGB channels slightly for realism
          float chromaticStrength = primaryRing * 0.02;  // Very subtle
          vec3 chromaticRing = ringColor * prGlow;
          chromaticRing.r *= 1.0 + chromaticStrength;  // Red shifts outward
          chromaticRing.b *= 1.0 - chromaticStrength;  // Blue shifts inward
          
          color = color + chromaticRing;
          
          posX = newPosX;
          posY = newPosY;
          posZ = newPosZ;
          
          if (alpha > 0.95) break;
        }
        
        // === EINSTEIN RING and SECONDARY LENSED ARCS ===
        float rayClosest = -camX * rdX - camY * rdY - camZ * rdZ;
        if (rayClosest > 0.0) {
          float cpX = camX + rdX * rayClosest;
          float cpY = camY + rdY * rayClosest;
          float cpZ = camZ + rdZ * rayClosest;
          float closestR = sqrt(cpX * cpX + cpY * cpY + cpZ * cpZ);
          
          // Portal moment sync for arcs
          float arcPortal = sin(u_time * 0.4) * 0.5 + 0.5;
          float arcIntensity = 0.8 + 0.3 * arcPortal;
          
          // Einstein ring at ~2.6 Rs
          float erDist = closestR - RS * 2.6;
          float einsteinRing = exp(-erDist * erDist * 80.0);
          color = color + vec3(1.0, 0.88, 0.65) * einsteinRing * 0.35 * arcIntensity * (1.0 - alpha * 0.7);
          
          // Secondary lensed arc (underside of disk bent upward)
          // Faint mirror arc above/below disk - appears during portal peaks
          // Fade in slightly on hover for enhanced visibility
          float secondaryArcDist = abs(closestR - RS * 3.5);
          float arcHoverBoost = 1.0 + u_hover * 0.2;  // Subtle 20% boost on hover
          float secondaryArc = exp(-secondaryArcDist * secondaryArcDist * 45.0) * 0.25 * arcIntensity * arcHoverBoost;
          
          // Upper arc (above disk plane)
          float upperArcY = cpY;
          float upperWeight = smoothstep(-0.5, 0.5, upperArcY) * 0.6;
          
          // Lower arc (below disk plane)
          float lowerWeight = smoothstep(0.5, -0.5, upperArcY) * 0.6;
          
          // Combined arc with warm disk-like color
          vec3 arcColor = vec3(1.05, 0.72, 0.38) * secondaryArc * (upperWeight + lowerWeight) * (1.0 - alpha * 0.8);
          color = color + arcColor;
        }
        
        // === ISCO GAP indicator - subtle dark ring between photon sphere and disk ===
        float screenR = length(uv);
        float iscoScreenR = 0.08;  // Approximate screen position of ISCO
        float gapDist = abs(screenR - iscoScreenR);
        float iscoGap = 1.0 - exp(-gapDist * gapDist * 800.0) * 0.15;
        color = color * iscoGap;
        
        ${
          quality.bloomEnabled
            ? `
        float lum = dot(color, vec3(0.299, 0.587, 0.114));
        float bloomMult = smoothstep(0.6, 2.0, lum) * 0.2;
        color = color + color * bloomMult;
        `
            : ""
        }
        
        color.x = (color.x * (2.51 * color.x + 0.03)) / (color.x * (2.43 * color.x + 0.59) + 0.14);
        color.y = (color.y * (2.51 * color.y + 0.03)) / (color.y * (2.43 * color.y + 0.59) + 0.14);
        color.z = (color.z * (2.51 * color.z + 0.03)) / (color.z * (2.43 * color.z + 0.59) + 0.14);
        
        color = pow(clamp(color, 0.0, 1.0), vec3(0.4545));
        
        float vigDist = length(uv);
        color = color * (0.92 + 0.08 * (1.0 - smoothstep(0.5, 1.4, vigDist)));
        
        ${fragColorVar} = vec4(color, 1.0);
      }
    `

    function compileShader(source: string, type: number): WebGLShader | null {
      const shader = glContext!.createShader(type)
      if (!shader) {
        console.error("[v0] Failed to create shader")
        return null
      }
      glContext!.shaderSource(shader, source)
      glContext!.compileShader(shader)
      if (!glContext!.getShaderParameter(shader, glContext!.COMPILE_STATUS)) {
        const error = glContext!.getShaderInfoLog(shader)
        console.error("[v0] Shader compile error:", error)
        setShaderError(error?.substring(0, 500) || "Unknown shader error")
        return null
      }
      return shader
    }

    const vertexShader = compileShader(vertexShaderSource, glContext.VERTEX_SHADER)
    const fragmentShader = compileShader(fragmentShaderSource, glContext.FRAGMENT_SHADER)
    if (!vertexShader || !fragmentShader) {
      return
    }

    const shaderProgram = glContext.createProgram()
    if (!shaderProgram) {
      setWebglError(true)
      return
    }
    glContext.attachShader(shaderProgram, vertexShader)
    glContext.attachShader(shaderProgram, fragmentShader)
    glContext.linkProgram(shaderProgram)

    if (!glContext.getProgramParameter(shaderProgram, glContext.LINK_STATUS)) {
      const error = glContext.getProgramInfoLog(shaderProgram)
      console.error("[v0] Program link error:", error)
      setShaderError(error?.substring(0, 500) || "Program link failed")
      return
    }

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const buffer = glContext.createBuffer()
    glContext.bindBuffer(glContext.ARRAY_BUFFER, buffer)
    glContext.bufferData(glContext.ARRAY_BUFFER, positions, glContext.STATIC_DRAW)

    const positionLoc = glContext.getAttribLocation(shaderProgram, "a_position")
    glContext.enableVertexAttribArray(positionLoc)
    glContext.vertexAttribPointer(positionLoc, 2, glContext.FLOAT, false, 0, 0)

    const timeLoc = glContext.getUniformLocation(shaderProgram, "u_time")
    const resolutionLoc = glContext.getUniformLocation(shaderProgram, "u_resolution")
    const cameraZoomLoc = glContext.getUniformLocation(shaderProgram, "u_cameraZoom")
    const viewYawLoc = glContext.getUniformLocation(shaderProgram, "u_viewYaw")
    const viewPitchLoc = glContext.getUniformLocation(shaderProgram, "u_viewPitch")
    const hoverLoc = glContext.getUniformLocation(shaderProgram, "u_hover")

    const activateProgram = glContext["useProgram"].bind(glContext)
    activateProgram(shaderProgram)

    let resizeTimeout: NodeJS.Timeout
    function resize() {
      if (!canvas) return
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        const dpr = Math.min(window.devicePixelRatio * quality.pixelRatio, 2.5)
        canvas.width = Math.floor(window.innerWidth * dpr)
        canvas.height = Math.floor(window.innerHeight * dpr)
        canvas.style.width = window.innerWidth + "px"
        canvas.style.height = window.innerHeight + "px"
        glContext!.viewport(0, 0, canvas.width, canvas.height)
      }, 150)
    }

    resize()
    window.addEventListener("resize", resize)

    let isVisible = true
    function handleVisibilityChange() {
      isVisible = document.visibilityState === "visible"
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)

    const startTime = performance.now()
    let animationId: number
    let lastFrameTime = 0
    const frameInterval = 1000 / quality.targetFPS

    function render(currentTime: number) {
      animationId = requestAnimationFrame(render)

      if (!isVisible || contextLost) return

      const elapsed = currentTime - lastFrameTime
      if (elapsed < frameInterval) return

      lastFrameTime = currentTime - (elapsed % frameInterval)

      const time = (performance.now() - startTime) / 1000

      glContext!.uniform1f(timeLoc, time)
      glContext!.uniform2f(resolutionLoc, canvas!.width, canvas!.height)
      glContext!.uniform1f(cameraZoomLoc, cameraZoom)
      glContext!.uniform1f(viewYawLoc, viewYaw)
      glContext!.uniform1f(viewPitchLoc, viewPitch)
      glContext!.uniform1f(hoverLoc, hover)
      glContext!.drawArrays(glContext!.TRIANGLE_STRIP, 0, 4)
    }

    animationId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      clearTimeout(resizeTimeout)
      cancelAnimationFrame(animationId)
    }
  }, [cameraZoom, viewYaw, viewPitch, hover, ringBloomStrength, shiftExponent, dopplerBlueStrength, redshiftWarmStrength])

  if (shaderError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-center px-6 max-w-lg">
          <div className="text-white/90 text-lg mb-4">Visualization Error</div>
          <div className="text-white/60 text-sm mb-4">The graphics shader failed to compile on your device.</div>
          <details className="text-left">
            <summary className="text-white/70 text-xs cursor-pointer mb-2">Technical Details</summary>
            <pre className="text-white/50 text-xs overflow-auto max-h-32 p-2 bg-white/5 rounded">{shaderError}</pre>
          </details>
        </div>
      </div>
    )
  }

  if (webglError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-center px-6 max-w-md">
          <div className="text-white/90 text-lg mb-4">Graphics Not Supported</div>
          <div className="text-white/60 text-sm">This visualization requires WebGL. Please use a modern browser.</div>
        </div>
      </div>
    )
  }

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full block" 
      style={{ 
        background: "#000",
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0
      }} 
    />
  )
}
