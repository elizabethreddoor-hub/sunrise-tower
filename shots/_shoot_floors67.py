import asyncio
from playwright.async_api import async_playwright
U='http://localhost:8765/site/index.html'
SH=[('6F','?shot=f6&act=mira:坐位子,nova:坐位子'),('6F_meeting','?shot=f6&act=mira:開會,nova:開會'),('7F','?shot=f7')]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        allerr={}
        for name,q in SH:
            pg=await b.new_page(viewport={'width':1280,'height':800},device_scale_factor=1)
            errs=[]
            pg.on('pageerror',lambda e:errs.append('ERR '+str(e))); pg.on('console',lambda m: m.type=='error' and errs.append('CON '+m.text))
            await pg.goto(U+q,wait_until='networkidle',timeout=120000); await pg.wait_for_timeout(9000)
            info=await pg.evaluate("JSON.stringify({f:window.P7_floors67,s:window.P7_sched&&window.P7_sched(),roof:window.P7_roof,lit:[...document.querySelectorAll('#fbar button')].map(b=>b.textContent+(b.classList.contains('on')?'*':'')).join(' ')})")
            print(name,info)
            await pg.screenshot(path=f'/workspace/shots_out/floors67_{name}.png',timeout=120000)
            allerr[name]=errs; await pg.close()
        print('errors',allerr)
        await b.close()
asyncio.run(main())
