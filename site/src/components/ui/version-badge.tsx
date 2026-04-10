export function VersionBadge() {
  const version = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";

  return (
    <a
      href={
        version !== "dev"
          ? `https://github.com/onflux-tech/whatsmiau-manager/releases/tag/${version}`
          : "https://github.com/onflux-tech/whatsmiau-manager"
      }
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-2 right-2 z-50 rounded-md border border-border/50 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/60 backdrop-blur-sm transition-colors hover:text-muted-foreground"
    >
      {version}
    </a>
  );
}
