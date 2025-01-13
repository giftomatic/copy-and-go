class CopyNgoHandler {
  constructor(config = {}) {
    this.config = this.initializeConfig(config);
    this.form = document.getElementById(this.config.formId);
    this.copyButton = document.getElementById(this.config.copyButtonId);

    if (!this.form || !this.copyButton) {
      console.warn("Required elements are missing. Initialization aborted.");
      return;
    }

    this.attachEventListeners();
  }

  initializeConfig(config) {
    return {
      notificationId: config.notificationId || null,
      giftcodeId: config.giftcodeId || "giftcode",
      copyButtonId: config.copyButtonId || "copy-go",
      formId: config.formId || "copy-go-form",
      timeout: this.getValidatedTimeout(config.timeout),
      safariFormTarget: config.safariFormTarget || "_self",
    };
  }

  getValidatedTimeout(timeout) {
    const parsedTimeout = parseInt(timeout, 10);
    return isNaN(parsedTimeout) || parsedTimeout < 0 ? 3000 : parsedTimeout;
  }

  isSafari() {
    const ua = navigator.userAgent.toLowerCase();
    return (
      ua.includes("safari") &&
      !ua.includes("chrome") &&
      !ua.includes("chromium")
    );
  }

  attachEventListeners() {
    this.copyButton.addEventListener("click", () => {
      this.copyToClipboard();
      if (this.config.notificationId) {
        this.showNotification();
      }
    });

    if (this.shouldAttachFormListener()) {
      this.form.addEventListener("submit", (event) => {
        event.preventDefault();
        this.handleFormSubmissionWithDelay();
      });
    }
  }

  shouldAttachFormListener() {
    return (
      this.config.timeout > 0 &&
      (!this.isSafari() || this.config.safariFormTarget !== "_self")
    );
  }

  handleFormSubmissionWithDelay() {
    if (this.isSafari() && this.config.safariFormTarget === "_self") {
      this.form.target = "_self";
    }

    this.copyButton.disabled = true;
    setTimeout(() => {
      this.copyButton.disabled = false;
      this.form.submit();
    }, this.config.timeout);
  }

  showNotification() {
    const notification = document.getElementById(this.config.notificationId);
    if (notification) {
      notification.classList.add("active");
    }
  }

  copyToClipboard() {
    const giftcode = document.getElementById(this.config.giftcodeId);
    if (giftcode) {
      giftcode.select();
      giftcode.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(giftcode.value).catch((err) => {
        console.error("Failed to copy text: ", err);
      });
    }
  }
}
