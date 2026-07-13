export function getProjectSections(project, hasRelatedContent = false) {
  return [
    { id: "overview", label: "Overview", visible: true },
    { id: "features", label: "Features", visible: project.details.length > 0 },
    { id: "architecture", label: "Architecture", visible: Boolean(project.architecture?.length) },
    { id: "tech-stack", label: "Tech Stack", visible: project.stack.length > 0 },
    { id: "timeline", label: "Timeline", visible: Boolean(project.timeline?.length) },
    { id: "related", label: "Related", visible: hasRelatedContent },
  ].filter(section => section.visible);
}

export function getProjectFacts(project) {
  return [
    ["Version", project.version],
    ["License", project.license],
    ["Updated", project.updatedAt],
  ].filter(([, value]) => Boolean(value));
}
