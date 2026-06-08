import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useAuth } from "@/hooks/use-auth";
import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  (getAnonWorkData as any).mockReturnValue(null);
  (getProjects as any).mockResolvedValue([]);
  (createProject as any).mockResolvedValue({ id: "new-project-1" });
});

afterEach(() => {
  cleanup();
});

describe("useAuth", () => {
  test("returns signIn, signUp, and isLoading", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.signIn).toBeTypeOf("function");
    expect(result.current.signUp).toBeTypeOf("function");
    expect(result.current.isLoading).toBe(false);
  });

  describe("signIn", () => {
    test("calls signInAction with email and password", async () => {
      (signInAction as any).mockResolvedValue({ success: false, error: "bad" });
      const { result } = renderHook(() => useAuth());

      await act(() => result.current.signIn("a@b.com", "pass123"));

      expect(signInAction).toHaveBeenCalledWith("a@b.com", "pass123");
    });

    test("returns the auth result", async () => {
      const authResult = { success: true };
      (signInAction as any).mockResolvedValue(authResult);
      const { result } = renderHook(() => useAuth());

      let returned: any;
      await act(async () => {
        returned = await result.current.signIn("a@b.com", "pass");
      });

      expect(returned).toEqual(authResult);
    });

    test("returns error result on failure", async () => {
      const authResult = { success: false, error: "Invalid credentials" };
      (signInAction as any).mockResolvedValue(authResult);
      const { result } = renderHook(() => useAuth());

      let returned: any;
      await act(async () => {
        returned = await result.current.signIn("a@b.com", "wrong");
      });

      expect(returned).toEqual(authResult);
    });

    test("does not run post-sign-in logic on failure", async () => {
      (signInAction as any).mockResolvedValue({ success: false, error: "no" });
      const { result } = renderHook(() => useAuth());

      await act(() => result.current.signIn("a@b.com", "wrong"));

      expect(getAnonWorkData).not.toHaveBeenCalled();
      expect(getProjects).not.toHaveBeenCalled();
      expect(createProject).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    test("sets isLoading during execution", async () => {
      let resolveSignIn: any;
      (signInAction as any).mockImplementation(
        () => new Promise((r) => { resolveSignIn = r; })
      );
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      let promise: Promise<any>;
      act(() => {
        promise = result.current.signIn("a@b.com", "pass");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveSignIn({ success: false });
        await promise!;
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("resets isLoading when handlePostSignIn throws", async () => {
      (signInAction as any).mockResolvedValue({ success: true });
      (getAnonWorkData as any).mockReturnValue(null);
      (getProjects as any).mockRejectedValue(new Error("network"));
      const { result } = renderHook(() => useAuth());

      await expect(
        act(() => result.current.signIn("a@b.com", "pass"))
      ).rejects.toThrow("network");

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("signUp", () => {
    test("calls signUpAction with email and password", async () => {
      (signUpAction as any).mockResolvedValue({ success: false, error: "bad" });
      const { result } = renderHook(() => useAuth());

      await act(() => result.current.signUp("a@b.com", "pass123"));

      expect(signUpAction).toHaveBeenCalledWith("a@b.com", "pass123");
    });

    test("returns error result on failure", async () => {
      const authResult = { success: false, error: "Email taken" };
      (signUpAction as any).mockResolvedValue(authResult);
      const { result } = renderHook(() => useAuth());

      let returned: any;
      await act(async () => {
        returned = await result.current.signUp("a@b.com", "pass");
      });

      expect(returned).toEqual(authResult);
    });

    test("does not run post-sign-in logic on failure", async () => {
      (signUpAction as any).mockResolvedValue({ success: false, error: "no" });
      const { result } = renderHook(() => useAuth());

      await act(() => result.current.signUp("a@b.com", "pass"));

      expect(getAnonWorkData).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    test("resets isLoading when handlePostSignIn throws", async () => {
      (signUpAction as any).mockResolvedValue({ success: true });
      (getProjects as any).mockRejectedValue(new Error("boom"));
      const { result } = renderHook(() => useAuth());

      await expect(
        act(() => result.current.signUp("a@b.com", "pass"))
      ).rejects.toThrow("boom");

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("handlePostSignIn - anonymous work exists", () => {
    const anonWork = {
      messages: [{ role: "user", content: "hello" }],
      fileSystemData: { "/App.jsx": "code" },
    };

    beforeEach(() => {
      (getAnonWorkData as any).mockReturnValue(anonWork);
      (createProject as any).mockResolvedValue({ id: "anon-proj-42" });
    });

    test("creates project from anonymous work data", async () => {
      (signInAction as any).mockResolvedValue({ success: true });
      const { result } = renderHook(() => useAuth());

      await act(() => result.current.signIn("a@b.com", "pass"));

      expect(createProject).toHaveBeenCalledWith({
        name: expect.stringContaining("Design from "),
        messages: anonWork.messages,
        data: anonWork.fileSystemData,
      });
    });

    test("clears anonymous work after creating project", async () => {
      (signInAction as any).mockResolvedValue({ success: true });
      const { result } = renderHook(() => useAuth());

      await act(() => result.current.signIn("a@b.com", "pass"));

      expect(clearAnonWork).toHaveBeenCalled();
    });

    test("navigates to the new project", async () => {
      (signInAction as any).mockResolvedValue({ success: true });
      const { result } = renderHook(() => useAuth());

      await act(() => result.current.signIn("a@b.com", "pass"));

      expect(mockPush).toHaveBeenCalledWith("/anon-proj-42");
    });

    test("does not call getProjects when anon work exists", async () => {
      (signInAction as any).mockResolvedValue({ success: true });
      const { result } = renderHook(() => useAuth());

      await act(() => result.current.signIn("a@b.com", "pass"));

      expect(getProjects).not.toHaveBeenCalled();
    });

    test("works the same via signUp", async () => {
      (signUpAction as any).mockResolvedValue({ success: true });
      const { result } = renderHook(() => useAuth());

      await act(() => result.current.signUp("a@b.com", "pass"));

      expect(createProject).toHaveBeenCalledWith(
        expect.objectContaining({ messages: anonWork.messages })
      );
      expect(clearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/anon-proj-42");
    });
  });

  describe("handlePostSignIn - no anon work, existing projects", () => {
    beforeEach(() => {
      (getAnonWorkData as any).mockReturnValue(null);
      (getProjects as any).mockResolvedValue([
        { id: "proj-recent", name: "Recent" },
        { id: "proj-old", name: "Old" },
      ]);
    });

    test("navigates to the first (most recent) project", async () => {
      (signInAction as any).mockResolvedValue({ success: true });
      const { result } = renderHook(() => useAuth());

      await act(() => result.current.signIn("a@b.com", "pass"));

      expect(mockPush).toHaveBeenCalledWith("/proj-recent");
    });

    test("does not create a new project", async () => {
      (signInAction as any).mockResolvedValue({ success: true });
      const { result } = renderHook(() => useAuth());

      await act(() => result.current.signIn("a@b.com", "pass"));

      expect(createProject).not.toHaveBeenCalled();
    });
  });

  describe("handlePostSignIn - no anon work, no existing projects", () => {
    beforeEach(() => {
      (getAnonWorkData as any).mockReturnValue(null);
      (getProjects as any).mockResolvedValue([]);
      (createProject as any).mockResolvedValue({ id: "fresh-proj-1" });
    });

    test("creates a new empty project", async () => {
      (signInAction as any).mockResolvedValue({ success: true });
      const { result } = renderHook(() => useAuth());

      await act(() => result.current.signIn("a@b.com", "pass"));

      expect(createProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^New Design #\d+$/),
        messages: [],
        data: {},
      });
    });

    test("navigates to the new project", async () => {
      (signInAction as any).mockResolvedValue({ success: true });
      const { result } = renderHook(() => useAuth());

      await act(() => result.current.signIn("a@b.com", "pass"));

      expect(mockPush).toHaveBeenCalledWith("/fresh-proj-1");
    });
  });

  describe("handlePostSignIn - anon work with empty messages", () => {
    test("falls through to getProjects path", async () => {
      (getAnonWorkData as any).mockReturnValue({
        messages: [],
        fileSystemData: {},
      });
      (getProjects as any).mockResolvedValue([{ id: "existing" }]);
      (signInAction as any).mockResolvedValue({ success: true });
      const { result } = renderHook(() => useAuth());

      await act(() => result.current.signIn("a@b.com", "pass"));

      expect(createProject).not.toHaveBeenCalled();
      expect(clearAnonWork).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/existing");
    });
  });
});
