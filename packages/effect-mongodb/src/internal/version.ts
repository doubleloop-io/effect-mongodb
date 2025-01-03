let moduleVersion = "0.1.2"

export const getCurrentVersion = () => moduleVersion

export const setCurrentVersion = (version: string) => {
  moduleVersion = version
}
