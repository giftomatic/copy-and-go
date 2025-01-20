export type CopyAndGoConfig = {
  /**
   * Element or ID of the input element that contains the gift code that will be copied to the user's clipboard.
   */
  giftcode?: string | HTMLInputElement;
  /**
   * Element or ID of the button that will trigger the copy action.
   */
  copyButton?: string | HTMLButtonElement;
  /**
   * Element or ID of the form that will be submitted after the copy action.
   */
  form?: string | HTMLFormElement;
  /**
   * A timeout that will be applied before the form is submitted.
   * This gives the user time to see the notification (that the code is copied to the clipboard) before the form is submitted.
   */
  timeout?: number;
  /**
   * The safari browser can't submit the form in a new window/tab if the form is submitted by a script.
   * This option allows you overwrite specify the target attribute of the form element in Safari.
   */
  safariFormTarget?: string;
} & (
  | {
      /**
       * Specify the element or ID of the notification element that will be shown after the code is copied to the clipboard.
       * The notification will be shown by adding the class `active` to the element.
       */
      notification?: string | HTMLElement;
    }
  | {
      /**
       * Instead of adding the `active` class to the notification element,
       * you can specify a callback function that will be called after the code is copied to the clipboard,
       * e.g. to show your own notification to the user.
       */
      callback?: () => void;
    }
);

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
    // Safari can't submit the form in a new window/tab if the form is submitted by a script.
    // Only attach the submit listener if the timeout is set and the form should be opened in the same window/tab.
    const shouldAttachFormListener =
      this.#config.timeout > 0 &&
      (!isSafari() || this.#config.safariFormTarget === "_self");
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
