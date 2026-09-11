import { Suspense } from "react";
import { AIUsagePanel } from "@/components/home/ai-usage-panel";
import { Facts } from "@/components/home/facts";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { GitHubPanel, GitHubPanelSkeleton } from "@/components/home/github-panel";
import { Hero } from "@/components/home/hero";
import { LatestPosts } from "@/components/home/latest-posts";
import { TechMarquee } from "@/components/home/tech-marquee";
import { WhatIDo } from "@/components/home/what-i-do";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TechMarquee />
      <WhatIDo />
      <FeaturedProjects />
      <Facts />
      <Suspense fallback={<GitHubPanelSkeleton />}>
        <GitHubPanel />
      </Suspense>
      <AIUsagePanel />
      <LatestPosts />
    </>
  );
}
