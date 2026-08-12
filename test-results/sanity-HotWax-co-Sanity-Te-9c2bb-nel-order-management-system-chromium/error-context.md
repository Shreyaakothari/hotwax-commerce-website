# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sanity.spec.ts >> HotWax.co Sanity Test >> Check page: https://www.hotwax.co/omnichannel-order-management-system
- Location: tests/sanity.spec.ts:50:9

# Error details

```
Error: Page https://www.hotwax.co/omnichannel-order-management-system returned status 404

expect(received).not.toBe(expected) // Object.is equality

Expected: not 404
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - dialog "Cookie banner" [active] [ref=e2]:
    - generic [ref=e3]:
      - button "Dismiss cookie banner" [ref=e5] [cursor=pointer]
      - paragraph [ref=e10]:
        - text: By clicking “Accept”, you agree to the storing of cookies on your device to enhance site navigation, analyze site usage, and assist in our marketing efforts. Learn more about
        - link "Cookie Policy" [ref=e11] [cursor=pointer]:
          - /url: https://www.hotwax.co/privacy-policy
        - text: .
      - generic [ref=e14]:
        - button "Accept" [ref=e15] [cursor=pointer]
        - button "Decline" [ref=e16] [cursor=pointer]
  - banner [ref=e17]:
    - generic [ref=e18]:
      - link [ref=e22] [cursor=pointer]:
        - /url: https://www.hotwax.co/
        - img "HotWax Commerce" [ref=e23]
      - navigation [ref=e24]:
        - navigation "Navigation Menu" [ref=e26]:
          - menu [ref=e27]:
            - checkbox "Product" [ref=e28]
            - menuitem "Product" [ref=e29] [cursor=pointer]
            - menu
            - checkbox "Solutions" [ref=e30]
            - menuitem "Solutions" [ref=e31] [cursor=pointer]
            - menu
            - checkbox "Resources" [ref=e32]
            - menuitem "Resources" [ref=e33] [cursor=pointer]
            - menu
            - checkbox "Company" [ref=e34]
            - menuitem "Company" [ref=e35] [cursor=pointer]
            - menu
        - link "Contact Us" [ref=e38] [cursor=pointer]:
          - /url: https://cta-na2.hubspot.com/web-interactives/public/v1/track/click?encryptedPayload=AVxigLLk4qu1XJKsAD%2Fnh%2FIskYOzRsKM90SmmLg6TDdeS094zUNQCnpKW3qraBc%2F9AKqv3oTNPIuQu%2F8e1WLQuzA8qEWBwZYMpMN0AOwdf5g3EqyhyLoXlhxSkfRC9Zl6t9p1XGV63hHv22mEINsPrMZqtXXevms0XlmddQs49GljNzU&portalId=6357099
  - generic [ref=e39]:
    - main [ref=e40]:
      - generic [ref=e42]:
        - generic [ref=e43]: "404"
        - heading "Page not found." [level=1] [ref=e44]
        - link "Go Home" [ref=e45] [cursor=pointer]:
          - /url: /
    - generic [ref=e48]:
      - generic [ref=e49]:
        - generic [ref=e50]:
          - link [ref=e52] [cursor=pointer]:
            - /url: https://www.hotwax.co/
            - img "HotWax Commerce" [ref=e53]
          - generic [ref=e54]:
            - heading "Connect" [level=3] [ref=e55]
            - generic [ref=e57]:
              - generic [ref=e59]:
                - generic [ref=e60]: Email*
                - textbox "Email*" [ref=e62]:
                  - /placeholder: ""
              - button "Submit" [ref=e65] [cursor=pointer]
          - generic [ref=e66]:
            - heading "Headquarters" [level=3] [ref=e67]
            - paragraph [ref=e68]: 175 S Main St Suite 1310, Salt Lake City, UT 84111
        - navigation "Navigation Menu" [ref=e71]:
          - menu [ref=e72]:
            - menuitem "Product" [ref=e73] [cursor=pointer]
            - menu [ref=e74]:
              - menuitem "Omnichannel Order Management" [ref=e75] [cursor=pointer]
              - menuitem "FAQ" [ref=e76] [cursor=pointer]
              - menuitem "Product Updates" [ref=e77] [cursor=pointer]
              - menuitem "Documentation" [ref=e78] [cursor=pointer]
            - menuitem "Use cases" [ref=e79] [cursor=pointer]
            - menu [ref=e80]:
              - menuitem "Buy Online Pick-Up In Store" [ref=e81] [cursor=pointer]
              - menuitem "Configurable Order Routing" [ref=e82] [cursor=pointer]
              - menuitem "Ship From Store" [ref=e83] [cursor=pointer]
              - menuitem "Unified Inventory" [ref=e84] [cursor=pointer]
              - menuitem "Pre-Orders" [ref=e85] [cursor=pointer]
              - menuitem "Buy Online Return In Store" [ref=e86] [cursor=pointer]
              - menuitem "Store Inventory Management" [ref=e87] [cursor=pointer]
            - menuitem "Solutions" [ref=e88] [cursor=pointer]
            - menu [ref=e89]:
              - menuitem "Omnichannel OMS for Shopify" [ref=e90] [cursor=pointer]
              - menuitem "Omnichannel Retail Sales Audit" [ref=e91] [cursor=pointer]
      - generic [ref=e92]: © 2026 HotWax Commerce
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import axios from 'axios';
  3  | import { XMLParser } from 'fast-xml-parser';
  4  | 
  5  | /**
  6  |  * Sanity test to check for 404 errors on hotwax.co
  7  |  */
  8  | test.describe('HotWax.co Sanity Test', () => {
  9  |   let urls: string[] = [
  10 |     '/',
  11 |     '/blog',
  12 |     '/podcast',
  13 |     '/whitepaper',
  14 |     '/product-updates',
  15 |     '/omnichannel-order-management-system',
  16 |     '/netsuite-shopify-integration',
  17 |   ];
  18 | 
  19 |   test.beforeAll(async () => {
  20 |     try {
  21 |       console.log('Fetching sitemap for comprehensive testing...');
  22 |       const response = await axios.get('https://www.hotwax.co/sitemap.xml');
  23 |       const parser = new XMLParser();
  24 |       const jsonObj = parser.parse(response.data);
  25 |       
  26 |       if (jsonObj.urlset && jsonObj.urlset.url) {
  27 |         const sitemapUrls = jsonObj.urlset.url
  28 |           .map((u: any) => u.loc)
  29 |           .filter((url: string) => url && url.startsWith('http'));
  30 |         
  31 |         // Add a sample of URLs from the sitemap to avoid running thousands of tests
  32 |         // but still getting broad coverage
  33 |         const sampleSize = 20;
  34 |         const sampledUrls = sitemapUrls
  35 |           .sort(() => 0.5 - Math.random())
  36 |           .slice(0, sampleSize);
  37 |         
  38 |         urls = Array.from(new Set([...urls, ...sampledUrls]));
  39 |         console.log(`Added ${sampledUrls.length} URLs from sitemap. Total URLs to test: ${urls.length}`);
  40 |       }
  41 |     } catch (error) {
  42 |       console.error('Failed to fetch or parse sitemap, falling back to core URLs:', error.message);
  43 |     }
  44 |   });
  45 | 
  46 |   // Dynamically create tests for each URL
  47 |   for (const url of urls) {
  48 |     const formattedUrl = url.startsWith('http') ? url : `https://www.hotwax.co${url}`;
  49 |     
  50 |     test(`Check page: ${formattedUrl}`, async ({ page }) => {
  51 |       console.log(`Testing: ${formattedUrl}`);
  52 |       
  53 |       const response = await page.goto(formattedUrl, { waitUntil: 'domcontentloaded' });
  54 |       
  55 |       // Check status code (should not be 404)
  56 |       if (response) {
> 57 |         expect(response.status(), `Page ${formattedUrl} returned status ${response.status()}`).not.toBe(404);
     |                                                                                                    ^ Error: Page https://www.hotwax.co/omnichannel-order-management-system returned status 404
  58 |       }
  59 |       
  60 |       // Check for 404 text on the page (additional safety)
  61 |       const content = await page.content();
  62 |       const is404Page = content.includes('404') && 
  63 |                        (content.toLowerCase().includes('page not found') || 
  64 |                         content.toLowerCase().includes('not found'));
  65 |       
  66 |       expect(is404Page, `Page ${formattedUrl} appears to be a 404 error page based on content`).toBe(false);
  67 |       
  68 |       // Ensure the body is visible
  69 |       await expect(page.locator('body')).toBeVisible();
  70 |     });
  71 |   }
  72 | });
  73 | 
```