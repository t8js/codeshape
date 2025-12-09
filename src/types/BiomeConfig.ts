export type BiomeConfig = {
  $schema?: string;
  files?: {
    includes?: string[];
  };
  vcs?: {
    enabled?: boolean;
    clientKind?: string;
    useIgnoreFile?: boolean;
  };
};
