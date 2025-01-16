export type CopyAndGoConfig = {
  giftcode?: string | HTMLInputElement;
  copyButton?: string | HTMLButtonElement;
  form?: string | HTMLFormElement;
  timeout?: number;
  safariFormTarget?: string;
} & ({ notification?: string | HTMLElement } | { callback?: () => void });

type CopyAndGoConfigWithNotification = {
  notification?: string | HTMLElement;
  callback?: () => void;
  giftcode: string | HTMLInputElement;
  timeout: number;
  safariFormTarget: string;
};

export class CopyAndGo {
  #config: CopyAndGoConfigWithNotification;
  #form: HTMLFormElement;
  #copyButton: HTMLElement & { disabled: unknown };

  constructor(config: CopyAndGoConfig = {}) {
    this.#config = {
      notification: "notification" in config ? config.notification : undefined,
      callback: "callback" in config ? config.callback : undefined,
      giftcode: config.giftcode || "giftcode",
      timeout: getValidatedTimeout(config.timeout),
      safariFormTarget: config.safariFormTarget || "_self",
    };

    const form =
      typeof config.form === "string"
        ? document.getElementById(config.form)
        : !config.form
        ? document.getElementById("copy-go-form")
        : config.form;
    const copyButton =
      typeof config.copyButton === "string"
        ? document.getElementById(config.copyButton)
        : !config.copyButton
        ? document.getElementById("copy-go")
        : config.copyButton;

    if (
      !(form instanceof HTMLFormElement) ||
      !(copyButton instanceof HTMLElement && "disabled" in copyButton)
    ) {
      console.warn("Required elements are missing. Initialization aborted.");
      return;
    }

    this.#form = form;
    this.#copyButton = copyButton;

    this.attach();
  }

  attach() {
    this.#copyButton.addEventListener("click", this.#clickListener);
    const shouldAttachFormListener =
      this.#config.timeout > 0 &&
      (!isSafari() || this.#config.safariFormTarget !== "_self");
    if (shouldAttachFormListener) {
      this.#form.addEventListener("submit", this.#submitListener);
    }
  }

  detach() {
    this.#copyButton.removeEventListener("click", this.#clickListener);
    this.#form.removeEventListener("submit", this.#submitListener);
  }

  #clickListener = (_: MouseEvent) => {
    const giftcode =
      typeof this.#config.giftcode === "string"
        ? document.getElementById(this.#config.giftcode)
        : this.#config.giftcode;
    if (giftcode instanceof HTMLInputElement) {
      copyToClipboard(giftcode);
    }

    if (typeof this.#config.notification == "string") {
      const notification = document.getElementById(this.#config.notification);
      if (notification) {
        notification.classList.add("active");
      }
    } else if (this.#config.callback) {
      this.#config.callback();
    }
  };

  #submitListener = (event: SubmitEvent) => {
    event.preventDefault();

    if (isSafari() && this.#config.safariFormTarget === "_self") {
      this.#form.target = "_self";
    }

    this.#copyButton.disabled = true;
    setTimeout(() => {
      this.#copyButton.disabled = false;
      this.#form.submit();
    }, this.#config.timeout);
  };
}

function isSafari() {
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium")
  );
}

function getValidatedTimeout(timeout: number | string | null | undefined) {
  const parsedTimeout =
    timeout === null || timeout === undefined
      ? 3000
      : typeof timeout === "string"
      ? parseInt(timeout, 10)
      : timeout;
  return isNaN(parsedTimeout) || parsedTimeout < 0 ? 3000 : parsedTimeout;
}

function copyToClipboard(giftcode: HTMLInputElement) {
  giftcode.select();
  giftcode.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(giftcode.value).catch((err) => {
    console.error("Failed to copy text: ", err);
  });
}
