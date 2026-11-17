"""Capture the real asset comparison HTML; no image editing or native-device claim."""
import asyncio,json,os,pathlib
from playwright.async_api import async_playwright
HERE=pathlib.Path(__file__).resolve().parent
async def main():
 registry=json.loads((HERE.parents[1]/'brand-assets/dimensional-icons.json').read_text());expected=len(registry['icons'])*12+sum(bool(x.get('brand_logo'))for x in registry['icons'].values())
 async with async_playwright()as p:
  browser=await p.chromium.launch(executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE'),args=['--no-sandbox']);page=await browser.new_page(viewport={'width':1800,'height':1200});await page.goto((HERE/'index.html').as_uri(),wait_until='load');assert await page.locator('img').count()==expected;assert await page.locator('img').evaluate_all('(items)=>items.every(i=>i.complete&&i.naturalWidth>0)');await page.screenshot(path=str(HERE/'icon-review.png'),full_page=True);await browser.close()
asyncio.run(main())
