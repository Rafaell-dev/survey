import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Reduz drasticamente o consumo de memória no build desabilitando paralelismo
    workerThreads: false,
    cpus: 1,
    // (Opcional, ajuda em alguns cenários)
    memoryBasedWorkersCount: true,
  },
};

export default nextConfig;
