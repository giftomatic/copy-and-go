export class CopyAndGo {
  constructor(config = {}) {
    this.config = {
      notificationId: config.notificationId || null,
      callback: config.callback || null,
      giftcodeId: config.giftcodeId || "giftcode",
      copyButtonId: config.copyButtonId || "copy-go",
      formId: config.formId || "copy-go-form",
      timeout: getValidatedTimeout(config.timeout),
      safariFormTarget: config.safariFormTarget || "_self",
    };

    this._form = document.getElementById(this.config.formId);
    this._copyButton = document.getElementById(this.config.copyButtonId);

    if (!this._form || !this._copyButton) {
      console.warn("Required elements are missing. Initialization aborted.");
      return;
    }

    this.attach();
  }

  attach() {
    this._copyButton.addEventListener("click", this._clickListener);
    const shouldAttachFormListener =
      this.config.timeout > 0 &&
      (!isSafari() || this.config.safariFormTarget !== "_self");
    if (shouldAttachFormListener) {
      this._form.addEventListener("submit", this._submitListener);
    }
  }

  detach() {
    this._copyButton.removeEventListener("click", this._clickListener);
    this._form.removeEventListener("submit", this._submitListener);
  }

  _clickListener = () => {
    copyToClipboard(this.config.giftcodeId);
    if (this.config.notificationId) {
      const notification = document.getElementById(this.config.notificationId);
      if (notification) {
        notification.classList.add("active");
      }
    } else if (this.config.callback) {
      this.config.callback();
    }
  };

  _submitListener = (event) => {
    event.preventDefault();

    if (isSafari() && this.config.safariFormTarget === "_self") {
      this._form.target = "_self";
    }

    this._copyButton.disabled = true;
    setTimeout(() => {
      this._copyButton.disabled = false;
      this._form.submit();
    }, this.config.timeout);
  };
}

function isSafari() {
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium")
  );
}

function getValidatedTimeout(timeout) {
  const parsedTimeout = parseInt(timeout, 10);
  return isNaN(parsedTimeout) || parsedTimeout < 0 ? 3000 : parsedTimeout;
}

function copyToClipboard(elementId) {
  const giftcode = document.getElementById(elementId);
  if (giftcode) {
    giftcode.select();
    giftcode.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(giftcode.value).catch((err) => {
      console.error("Failed to copy text: ", err);
    });
  }
}
