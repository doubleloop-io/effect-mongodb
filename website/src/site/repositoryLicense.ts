export const repositoryLicense = (manifest: unknown) => {
  const license = typeof manifest === "object" && manifest !== null && "license" in manifest
    ? manifest.license
    : undefined
  if (typeof license !== "string" || license === "") {
    throw new Error("The repository package.json must declare a license")
  }
  return license
}
