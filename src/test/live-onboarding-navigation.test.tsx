import type { ReactNode } from "react";
import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  data: { profile: { onboarded: false } },
  circleId: "joined-circle",
  outlet: vi.fn(() => null),
  feed: vi.fn(() => null),
  welcome: vi.fn(() => null),
}));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
  Outlet: state.outlet,
  redirect: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
vi.mock("@/components/live/context", () => ({
  useLive: () => state,
  LiveProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("@/components/live/shell", () => ({
  LiveShell: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("@/components/live/feed", () => ({ Feed: state.feed }));
vi.mock("@/components/live/wishes", () => ({ Onboarding: state.welcome }));

import { Route } from "@/routes/_authenticated/route";
import { Home } from "@/routes/_authenticated/home";

afterEach(() => { cleanup(); vi.clearAllMocks(); state.data.profile.onboarded = false; });
describe("Optional welcome setup", () => {
  it("allows the selected private page to run before setup is finished", () => {
    const Gate = Route.options.component;
    if (!Gate) throw new Error("Private layout component missing");
    render(<Gate />);
    expect(state.outlet).toHaveBeenCalled();
    expect(state.welcome).not.toHaveBeenCalled();
  });
  it("keeps inventory-first welcome on Home for a new circle member", () => {
    render(<Home />);
    expect(state.welcome).toHaveBeenCalled();
    expect(state.feed).not.toHaveBeenCalled();
  });
  it("shows the normal Home feed once optional setup is complete", () => {
    state.data.profile.onboarded = true;
    render(<Home />);
    expect(state.feed).toHaveBeenCalled();
    expect(state.welcome).not.toHaveBeenCalled();
  });
});