/** Tool identity stays stable across evolution; a subproject is never an evolution. */
export function openSourceEvolutionId(toolId: string, level: number) { return level === 5 ? `open-source:${toolId}` : `open-source:${toolId}:lv${level}`; }
export function openSourceIdentity(id: string) {
  const match = /^open-source:([a-z0-9-]+)(?::lv([1-4]))?$/.exec(id);
  return match ? { toolId: match[1], level: match[2] ? Number(match[2]) : 5 } : undefined;
}
export function openSourceArtKey(family: string, toolId: string, level: number) { return `monsters/open-source/${family}/${toolId}/${toolId}-lv${level}-v1.png`; }
