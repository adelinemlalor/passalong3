import asyncio,json,os,secrets,requests,concurrent.futures
from urllib.parse import urlparse
from playwright.async_api import async_playwright
B=os.environ['SUPABASE_URL'];K=os.environ['SUPABASE_SERVICE_ROLE_KEY'];P=os.environ['VITE_SUPABASE_PUBLISHABLE_KEY'];H={'apikey':K,'Authorization':'Bearer '+K,'Content-Type':'application/json'}
users=[];sessions=[];circles=[];photos=[]
def rest(path,method='get',body=None,h=H):
 r=getattr(requests,method)(B+'/rest/v1/'+path,headers={**h,'Prefer':'return=representation'},json=body) if method!='get' else requests.get(B+'/rest/v1/'+path,headers=h)
 r.raise_for_status();return r.json() if r.content else []
def rpc(action,payload,h):return requests.post(B+'/rest/v1/rpc/circle_action',headers=h,json={'action':action,'payload':payload})
def live(action,payload,h):return requests.post(B+'/rest/v1/rpc/passalong_action',headers=h,json={'action':action,'payload':payload})
async def restore(page,s,path):
 await page.goto('http://localhost:8080');await page.evaluate('([k,v])=>localStorage.setItem(k,v)',['sb-'+urlparse(os.environ['VITE_SUPABASE_URL']).hostname.split('.')[0]+'-auth-token',json.dumps(s)]);await page.goto('http://localhost:8080'+path,wait_until='networkidle')
async def main():
 try:
  for n in range(4):
   email='circle-check-'+secrets.token_hex(5)+('@berkeley.edu' if n<3 else '@example.com');pw=secrets.token_urlsafe(24)
   r=requests.post(B+'/auth/v1/admin/users',headers=H,json={'email':email,'password':pw,'email_confirm':True});r.raise_for_status();users.append(r.json()['id'])
   r=requests.post(B+'/auth/v1/token?grant_type=password',headers={'apikey':P},json={'email':email,'password':pw});r.raise_for_status();sessions.append(r.json());rest('profiles?id=eq.'+users[-1],'patch',{'onboarded':True,'display_name':'Verification member '+str(n),'bio':'Garden club member','general_area':'South Berkeley'})
  hs=[{'apikey':P,'Authorization':'Bearer '+s['access_token'],'Content-Type':'application/json'} for s in sessions]
  haas=rest('circles?name=eq.Haas%20FTMBA%202027')[0];assert not live('join',{'token':haas['invite_token']},hs[3]).ok
  async with async_playwright() as p:
   b=await p.chromium.launch(headless=True);ctx=await b.new_context(viewport={'width':1280,'height':1800},permissions=['clipboard-read','clipboard-write']);a=await ctx.new_page();errors=[];a.on('pageerror',lambda e:errors.append(str(e)))
   await restore(a,sessions[0],'/circles');await a.get_by_role('link',name='Start a circle',exact=True).click();await a.get_by_label('Circle name',exact=True).fill('Verification Garden Club');await a.get_by_label('Short description',exact=True).fill('A temporary circle for verification.');await a.get_by_label('General area',exact=False).fill('South Berkeley');await a.get_by_label('Anyone nearby can join',exact=True).check();await a.set_input_files('input[aria-label="Upload photo file"]','/tmp/browser/passalong/photo.jpg');await a.get_by_role('button',name='Create circle',exact=True).click();await a.get_by_role('heading',name='Your circle is ready',exact=True).wait_for();cid=a.url.split('/c/')[1].split('?')[0];circles.append(cid);photos.append(rest('circles?id=eq.'+cid)[0]['photo_url']);await a.get_by_role('button',name='Share to group chat',exact=True).click();assert 'Join my circle Verification Garden Club on Passalong:' in await a.evaluate('navigator.clipboard.readText()');await a.screenshot(path='/tmp/browser/part6a/created-desktop.png')
   print('circle creation/photo/group sharing read back through UI')
   for name,rule in [('Verification Request Club','request'),('Verification Hidden Club','invite_only')]:
    r=rpc('create',{'name':name,'general_area':'South Berkeley','type':'Club or team','join_rule':rule},hs[0]);r.raise_for_status();circles.append(r.json()['id'])
   req,hidden=circles[1:3]
   find=requests.post(B+'/rest/v1/rpc/find_circles',headers=hs[1],json={}).json();assert hidden not in [x['id'] for x in find];assert cid in [x['id'] for x in find]
   rctx=await b.new_context(viewport={'width':390,'height':844});rpage=await rctx.new_page();rpage.on('pageerror',lambda e:errors.append(str(e)))
   await restore(rpage,sessions[1],'/find-circles');await rpage.get_by_label('Search circles').fill('Verification Garden Club');await rpage.get_by_role('button',name='Join',exact=True).click();await rpage.get_by_role('link',name='Open',exact=True).wait_for();await rpage.get_by_role('link',name='Open',exact=True).click();await rpage.get_by_role('tab',name='Members',exact=True).click();await rpage.get_by_role('link',name='Verification member 0',exact=False).click();await rpage.wait_for_url('**/member/**');await rpage.get_by_role('heading',name='Verification member 0',exact=True,level=1).wait_for();await rpage.get_by_text('Garden club member',exact=True).wait_for();await rpage.screenshot(path='/tmp/browser/part6a/member-mobile.png')
   await rpage.goto('http://localhost:8080/find-circles',wait_until='networkidle');await rpage.get_by_label('Search circles').fill('Verification Request Club');await rpage.get_by_role('button',name='Ask to join',exact=True).click();await rpage.get_by_role('button',name='Request pending',exact=True).wait_for();assert requests.post(B+'/rest/v1/rpc/circle_members_detail',headers=hs[1],json={'circle':req}).json()==[]
   await a.goto('http://localhost:8080/c/'+req,wait_until='networkidle');await a.get_by_role('button',name='Approve',exact=True).click();await a.get_by_role('button',name='Approve',exact=True).wait_for(state='hidden');assert rest('circle_members?circle_id=eq.'+req+'&user_id=eq.'+users[1])[0]['status']=='active'
   print('discovery open join, request approval, hidden invite-only circle and private member profile verified')
   # Owner joins second circle only receiver belongs to it, not the primary.
   rpc('join',{'circle_id':cid},hs[2]).raise_for_status();rpc('join',{'circle_id':req},hs[2]).raise_for_status();rpc('approve',{'circle_id':req,'user_id':users[2]},hs[0]).raise_for_status();rpc('leave',{'circle_id':cid},hs[2]).raise_for_status()
   await a.goto('http://localhost:8080/post',wait_until='networkidle');assert await a.locator('input[type=checkbox]:checked').count()==3
   await a.get_by_label('Verification Hidden Club',exact=True).uncheck();await a.set_input_files('input[aria-label="Upload photo file"]','/tmp/browser/passalong/photo.jpg');await a.get_by_label('Title',exact=True).fill('Garden pots verification');await a.get_by_role('combobox').filter(has=a.locator('option:has-text("Good")')).select_option('Good');await a.get_by_role('combobox').filter(has=a.locator('option:text-is("Garden")')).select_option('Garden');await a.get_by_role('combobox').filter(has=a.locator('option:has-text("Near campus")')).select_option('Near campus');await a.get_by_role('button',name='Post',exact=True).click();await a.get_by_role('button',name='Continue and post',exact=True).click();await a.get_by_role('heading',name='Garden pots verification',exact=True).wait_for();item=a.url.split('/')[-1];photos.append(rest('items?id=eq.'+item)[0]['photo_path']);assert len(rest('item_circles?item_id=eq.'+item))==2
   assert len(rest('items?id=eq.'+item,h=hs[2]))==1;assert rest('items?id=eq.'+item,h=hs[3])==[];assert not live('claim',{'item_id':item},hs[3]).ok
   live('wish',{'circle_id':req,'text':'pots','category':'Garden'},hs[2]).raise_for_status();await restore(rpage,sessions[2],'/home');await rpage.get_by_text('Matches your wishlist: pots',exact=True).wait_for();await rpage.goto('http://localhost:8080/browse',wait_until='networkidle');await rpage.get_by_label('Filter items by circle').select_option(req);await rpage.get_by_role('heading',name='Garden pots verification',exact=True).wait_for();await rpage.screenshot(path='/tmp/browser/part6a/shared-mobile.png')
   print('all audiences checked, shared item visible/matched through secondary circle, outsider reads and claims rejected')
   await rpage.goto('http://localhost:8080/i/'+item,wait_until='networkidle');await rpage.get_by_role('button',name='Claim it',exact=True).click();await rpage.get_by_role('button',name='Pickup arranged',exact=True).wait_for();claim=rpage.url.split('/')[-1];assert not live('claim',{'item_id':item},hs[1]).ok
   await rpage.get_by_role('button',name='Pickup arranged',exact=True).click();await rpage.get_by_role('button',name='Mark picked up',exact=True).click();await rpage.get_by_role('button',name='Thank the giver',exact=True).click()
   print('secondary-circle claim, arrange, pickup and thanks verified')
   # desktop member management, transfer and leave
   await a.goto('http://localhost:8080/c/'+req,wait_until='networkidle');await a.get_by_role('tab',name='Members',exact=True).click();row=a.locator('.circle-member').filter(has_text='Verification member 1');await row.get_by_role('button',name='Make owner').click();await a.get_by_role('button',name='Confirm',exact=True).click();await a.get_by_role('dialog').wait_for(state='hidden');assert rest('circles?id=eq.'+req)[0]['owner_id']==users[1]
   assert not rpc('leave',{'circle_id':req},hs[1]).ok;rpc('leave',{'circle_id':req},hs[0]).raise_for_status()
   # rotation and member restriction
   old=rest('circles?id=eq.'+cid)[0]['invite_token'];rpc('rotate_invite',{'circle_id':cid},hs[0]).raise_for_status();assert not live('join',{'token':old},hs[3]).ok
   rpc('edit',{'circle_id':cid,'members_can_invite':False},hs[0]).raise_for_status();mine=requests.post(B+'/rest/v1/rpc/my_circles',headers=hs[1],json={}).json();assert next(x for x in mine if x['id']==cid)['invite_token'] is None;assert not requests.get(B+'/rest/v1/circles?select=invite_token',headers=hs[1]).ok
   rpc('remove_member',{'circle_id':cid,'user_id':users[1]},hs[0]).raise_for_status();assert not rpc('edit',{'circle_id':req,'name':'Bad'},hs[2]).ok
   for width,height in [(390,844),(1067,1128),(1280,1800)]:
    await a.set_viewport_size({'width':width,'height':height});await a.goto('http://localhost:8080/circles',wait_until='networkidle');assert await a.locator('html').evaluate('(e)=>e.scrollWidth<=innerWidth');await a.screenshot(path='/tmp/browser/part6a/circles-'+str(width)+'.png')
   # five owned circle cap and field limits
   while len(rest('circles?owner_id=eq.'+users[0]))<5:
    x=rpc('create',{'name':'Verification cap '+secrets.token_hex(2),'general_area':'Berkeley'},hs[0]);x.raise_for_status();circles.append(x.json()['id'])
   assert not rpc('create',{'name':'Sixth','general_area':'Berkeley'},hs[0]).ok
   assert not rpc('create',{'name':'n'*51,'general_area':'Berkeley'},hs[3]).ok;assert not rpc('create',{'name':'Bad description','description':'x'*201,'general_area':'Berkeley'},hs[3]).ok;assert not rpc('create',{'name':'Bad area','general_area':'123 Example Street'},hs[3]).ok
   assert not errors,errors;print('owner transfer/leave, rotation, removal, invite permissions, five-circle cap and phone/desktop layouts verified; no runtime errors');await b.close()
 finally:
  if users:
   claims=rest('claims?receiver_id=in.('+','.join(users)+')&select=id');ids=[x['id'] for x in claims]
   for table,col,values in [('messages','claim_id',ids),('chat_reports','claim_id',ids),('notifications','user_id',users),('events','user_id',users),('item_matches','user_id',users),('item_watchers','user_id',users),('swipe_passes','user_id',users),('claims','id',ids),('wishes','user_id',users),('items','giver_id',users),('circle_members','user_id',users),('circles','id',circles)]:
    if values:requests.delete(B+'/rest/v1/'+table+'?'+col+'=in.('+','.join(values)+')',headers=H).raise_for_status()
   if photos:requests.delete(B+'/storage/v1/object/item-photos',headers=H,json={'prefixes':photos})
   for u in users:requests.delete(B+'/auth/v1/admin/users/'+u,headers=H).raise_for_status()
  print('temporary accounts, items and circles removed')
asyncio.run(main())
