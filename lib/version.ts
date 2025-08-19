// App version configuration
export const APP_VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  build: "257763",
} as const

// Generate version string
export const getVersionString = () => {
  return `${APP_VERSION.major}.${APP_VERSION.minor}.${APP_VERSION.patch}`
}

// Generate full version string with build
export const getFullVersionString = () => {
  return `${getVersionString()}.${APP_VERSION.build}`
}

// Get version info object
export const getVersionInfo = () => {
  return {
    version: getVersionString(),
    fullVersion: getFullVersionString(),
    major: APP_VERSION.major,
    minor: APP_VERSION.minor,
    patch: APP_VERSION.patch,
    build: APP_VERSION.build,
    releaseDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
  }
}

// Version comparison utilities
export const compareVersions = (v1: string, v2: string): number => {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0
    const part2 = parts2[i] || 0
    
    if (part1 > part2) return 1
    if (part1 < part2) return -1
  }
  
  return 0
}

export const isNewerVersion = (newVersion: string, currentVersion: string): boolean => {
  return compareVersions(newVersion, currentVersion) > 0
}