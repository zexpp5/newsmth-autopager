# ShuiMu BBS Multi-Page Auto Loader (Tampermonkey Script)

## Introduction

This userscript is designed for the [ShuiMu BBS](https://www.newsmth.net/) modern web interface. It **automatically loads the first N pages (default: 10) of any thread** when you open a post, saving you from manual page flipping.

- Compatible with SPA (single-page app) navigation (`#!article/` URLs)
- Handles GBK encoding to prevent Chinese character garbling
- User-friendly: additional posts are seamlessly appended at the end of the thread
- Includes detailed debug logs in the browser console for troubleshooting

---

## Features

- Automatically loads the first N pages of a thread (N is configurable at the top of the script)
- Supports ShuiMu BBS's modern SPA routing
- Correctly decodes GBK to avoid character corruption
- Appends posts in order after the current page's content
- Provides detailed console logs for debugging and maintenance

---

## Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension
2. Create a new userscript and paste the contents of `waterwood-autoload.user.js`
3. Save and ensure the script is enabled for `https://www.newsmth.net/nForum/*`

---

## Usage

- Open any ShuiMu BBS thread page (e.g., `https://www.newsmth.net/nForum/#!article/OurEstate/xxxxxx`)
- The script will automatically load and append up to N pages of posts below the current content
- To change how many pages are auto-loaded, **edit the `AUTOLOAD_PAGES` variable at the top of the script** and save:

    ```javascript
    // ====== Only modify this parameter ======
    const AUTOLOAD_PAGES = 10; // Set to how many pages you want to auto-load
    ```

---

## Maintenance Notes

- If ShuiMu BBS updates its layout, check and update selectors like `#body` and `.a-wrap.corner` as needed
- If you see garbled (corrupted) Chinese text, make sure your browser and Tampermonkey support `TextDecoder("gbk")`
- Check the browser console for `[BBS-Autoload]` logs to help diagnose any issues

---

## FAQ

- **Why does the script sometimes not work?**  
  Make sure the page URL starts with `#!article/` and Tampermonkey is enabled.
- **Why is the appended content garbled?**  
  Use the latest version of Chrome or Edge, or try Tampermonkey Beta.
- **How do I disable auto-loading?**  
  Simply disable this script in your Tampermonkey dashboard.

---

## License

Open source for learning and personal use. Contributions and improvements are welcome.

---