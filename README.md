# copy-and-go

![NPM Version](https://img.shields.io/npm/v/%40giftomatic%2Fcopy-and-go)

A simple script to copy a input value to clipboard, showing a notification and redirecting to a new page.

## Install

Install through NPM:

```bash
npm install --save @giftomatic/copy-and-go
```

### Example

```js
import { CopyAndGo } from "@giftomatic/copy-and-go";
const copyAndGo = new CopyAndGo({
  callback: () => {
    document.getElementById("notification")?.classList?.add("active");
  },
  giftcode: "giftcode",
  copyButton: "copy-go",
  form: "copy-go-form",
  timeout: 3000, // Set to 0 to omit the delay
  safariFormTarget: "_self", // Options: "_self" or any other value
});
console.log({ CopyAndGo, copyAndGo });
```

Or see the [full example](./example/)

## Install through jsDelivr

```js
import { CopyAndGo } from "https://cdn.jsdelivr.net/npm/@giftomatic/copy-and-go@1/+esm";
```
