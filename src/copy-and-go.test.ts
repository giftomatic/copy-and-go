import { describe, beforeEach, afterEach, expect, test, vi } from "vitest";
import { CopyAndGo } from "./copy-and-go";

function sum(a: number, b: number): number {
  return a + b;
}

describe("CopyAndGo", () => {
  function setupElements() {
    const form = document.createElement("form");
    form.setAttribute("id", "copy-go-form");
    document.body.appendChild(form);

    const copyButton = document.createElement("button");
    copyButton.setAttribute("id", "copy-go");
    document.body.appendChild(copyButton);

    const input = document.createElement("input");
    input.setAttribute("id", "giftcode");
    input.setAttribute("value", "123456");
    document.body.appendChild(input);

    return { form, copyButton, input };
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("call callback after clicking the button", () => {
    const { copyButton } = setupElements();

    const callback = vi.fn();

    new CopyAndGo({
      callback: callback,
    });

    copyButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(callback).toHaveBeenCalled();
  });

  test("copy code to the clipboard", async () => {
    const { copyButton, form, input } = setupElements();

    const callback = vi.fn();

    new CopyAndGo({
      callback: callback,
      copyButton: copyButton,
      form: form,
      giftcode: input,
    });

    copyButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const text = await navigator.clipboard.readText();
    expect(text).toBe("123456");
  });

  test("submit the form should delay the submit so the user can see the copy notification", async () => {
    const { copyButton, form, input } = setupElements();

    const callback = vi.fn();

    new CopyAndGo({
      callback: callback,
      copyButton: copyButton,
      form: form,
      giftcode: input,
    });

    const open = vi.fn();
    vi.stubGlobal("open", open);

    form.dispatchEvent(new SubmitEvent("submit", { bubbles: true }));
    expect(open).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(open).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2000);
    expect(open).toHaveBeenCalled();
  });

  test("submitting a second time should call the callback immediately", async () => {
    const { copyButton, form, input } = setupElements();

    new CopyAndGo({
      copyButton: copyButton,
      form: form,
      giftcode: input,
    });

    const open = vi.fn();
    vi.stubGlobal("open", open);

    form.dispatchEvent(new SubmitEvent("submit", { bubbles: true }));
    expect(open).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000);
    expect(open).toHaveBeenCalledOnce();
    form.dispatchEvent(new SubmitEvent("submit", { bubbles: true }));
    expect(open).toBeCalledTimes(2);
  });

  test("submit after detach/attach should use the new timeout", async () => {
    const { copyButton, form, input } = setupElements();

    const cag = new CopyAndGo({
      copyButton: copyButton,
      form: form,
      giftcode: input,
    });

    const open = vi.fn();
    vi.stubGlobal("open", open);

    form.dispatchEvent(new SubmitEvent("submit", { bubbles: true }));
    expect(open).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000);
    expect(open).toHaveBeenCalledOnce();
    open.mockReset();

    cag.detach();
    cag.attach();

    form.dispatchEvent(new SubmitEvent("submit", { bubbles: true }));
    expect(open).not.toHaveBeenCalled();
    vi.advanceTimersToNextTimer();
    expect(open).toHaveBeenCalledOnce();
  });

  test("after detach the event listeners should not be called", () => {
    const { copyButton, form, input } = setupElements();

    const callback = vi.fn();

    const copyAndGo = new CopyAndGo({
      callback: callback,
      copyButton: copyButton,
      form: form,
      giftcode: input,
    });

    copyAndGo.detach();

    copyButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(callback).not.toHaveBeenCalled();

    const submit = vi.fn();
    form.submit = submit.bind(form);

    form.dispatchEvent(new SubmitEvent("submit", { bubbles: true }));
    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersToNextTimer();
  });

  test("pass an element as notification should add the 'active' class if the button is clicked", () => {
    const { copyButton, form, input } = setupElements();

    const notification = document.createElement("div");
    notification.setAttribute("id", "notification");
    document.body.appendChild(notification);

    const copyAndGo = new CopyAndGo({
      notification: "notification",
      copyButton: copyButton,
      form: form,
      giftcode: input,
    });

    copyButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(notification.classList.contains("active")).toBe(true);
  });
});
