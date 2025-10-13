interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  return (
    <header className="flex items-center text-sm px-3 py-4 flex-shrink-0">
      <h1 className="text-2xl font-bold tracking-wider text-accent">{title}</h1>
    </header>
  );
}
