import asyncio,sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        for name,url in [(n,u) for n,u in zip(sys.argv[1::2],sys.argv[2::2])]:
            pg=await b.new_page(viewport={'width':1280,'height':800})
            pg.on('pageerror',lambda e:print('ERR',e)); pg.on('console',lambda m: m.type=='error' and print('CON',m.text))
            await pg.goto('http://localhost:8765/index.html'+url); await pg.wait_for_timeout(14000)
            await pg.screenshot(path=f'/workspace/p007/shots/{name}.png',timeout=90000); print(name)
            await pg.close()
        await b.close()
asyncio.run(main())
