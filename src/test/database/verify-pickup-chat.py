import asyncio,json,os,secrets,requests
from urllib.parse import urlparse
from playwright.async_api import async_playwright
B=os.environ['SUPABASE_URL'];K=os.environ['SUPABASE_SERVICE_ROLE_KEY'];P=os.environ['VITE_SUPABASE_PUBLISHABLE_KEY'];H={'apikey':K,'Authorization':'Bearer '+K,'Content-Type':'application/json'}
users=[];sessions=[];circles=[];photos=[];promoted=[]
def rest(path,method='get',body=None,h=H):
 r=getattr(requests,method)(B+'/rest/v1/'+path,headers={**h,'Prefer':'return=representation'},json=body) if method!='get' else requests.get(B+'/rest/v1/'+path,headers=h)
 r.raise_for_status();return r.json() if r.content else []
def rpc(name,body,h):return requests.post(B+'/rest/v1/rpc/'+name,headers=h,json=body)
def live(action,payload,h):return rpc('passalong_action',{'action':action,'payload':payload},h)
async def restore(page,s,path):
 await page.goto('http://localhost:8080');await page.evaluate('([k,v])=>localStorage.setItem(k,v)',['sb-'+urlparse(os.environ['VITE_SUPABASE_URL']).hostname.split('.')[0]+'-auth-token',json.dumps(s)]);await page.goto('http://localhost:8080'+path,wait_until='networkidle')
async def main():
 try:
  for n in range(3):
   email='pickup-'+secrets.token_hex(5)+'@berkeley.edu';pw=secrets.token_urlsafe(24)
   r=requests.post(B+'/auth/v1/admin/users',headers=H,json={'email':email,'password':pw,'email_confirm':True});r.raise_for_status();users.append(r.json()['id'])
   r=requests.post(B+'/auth/v1/token?grant_type=password',headers={'apikey':P},json={'email':email,'password':pw});r.raise_for_status();sessions.append(r.json());rest('profiles?id=eq.'+users[-1],'patch',{'onboarded':True,'display_name':'Pickup Tester '+str(n),'pickup_times':['Weekday evenings']})
  hs=[{'apikey':P,'Authorization':'Bearer '+s['access_token'],'Content-Type':'application/json'} for s in sessions]
  c=rpc('circle_action',{'action':'create','payload':{'name':'Pickup Verification Circle','general_area':'Berkeley','join_rule':'open'}},hs[0]);c.raise_for_status();cid=c.json()['id'];circles.append(cid)
  for h in hs[1:]:rpc('circle_action',{'action':'join','payload':{'circle_id':cid}},h).raise_for_status()
  async with async_playwright() as p:
   b=await p.chromium.launch(headless=True);gctx=await b.new_context(viewport={'width':1280,'height':1800});rctx=await b.new_context(viewport={'width':390,'height':844});g=await gctx.new_page();rpage=await rctx.new_page();errors=[]
   for page in [g,rpage]:page.on('pageerror',lambda e:errors.append(str(e)))
   await restore(g,sessions[0],'/post');await restore(rpage,sessions[1],'/notifications')
   await g.set_input_files('input[aria-label="Upload photo file"]','/tmp/browser/passalong/photo.jpg');await g.get_by_label('Title',exact=True).fill('Pickup verification lamp');await g.get_by_role('combobox').filter(has=g.locator('option:text-is("Good")')).select_option('Good');await g.get_by_role('combobox').filter(has=g.locator('option:text-is("Near campus")')).select_option('Near campus');await g.get_by_role('button',name='Home & kitchen',exact=True).click()
   for style in ['Porch pickup','Hand-off at my place','Meet up nearby','I can drop it off']:await g.get_by_role('button',name=style,exact=True).click()
   await g.get_by_role('button',name='Porch pickup',exact=True).click();await g.get_by_role('button',name='Post',exact=True).click();await g.get_by_role('button',name='Continue and post',exact=True).click();await g.get_by_role('heading',name='Pickup verification lamp',exact=True).wait_for();item=g.url.split('/')[-1];photos.append(rest('items?id=eq.'+item)[0]['photo_path']);assert rest('items?id=eq.'+item)[0]['pickup_style']=='Porch pickup'
   await g.goto('http://localhost:8080/notifications',wait_until='networkidle');await rpage.goto('http://localhost:8080/i/'+item,wait_until='networkidle');await rpage.get_by_role('button',name='Claim it',exact=True).click();await rpage.wait_for_url('**/messages/*');claim=rpage.url.split('/')[-1]
   await g.get_by_text('Pickup 1. claimed your Pickup verification lamp.',exact=True).wait_for(timeout=15000);await g.get_by_role('link',name='Open chat',exact=True).click();await g.get_by_role('button',name="I'll leave it on my porch 📦",exact=True).click();assert await g.get_by_label('Message',exact=True).input_value()=="I'll leave it on my porch 📦";assert not rest('messages?claim_id=eq.'+claim);await g.get_by_role('button',name='Send message',exact=True).click();await rpage.get_by_text("I'll leave it on my porch 📦",exact=True).wait_for(timeout=15000);await g.get_by_text('Seen',exact=False).wait_for(timeout=15000)
   print('real post, claim, instant in-app notification, explicit quick reply and Seen verified')
   await g.get_by_role('button',name='Suggest times',exact=True).click();dialog=g.get_by_role('dialog',name='Suggest times');buttons=dialog.get_by_role('button');assert await buttons.count()==7
   for n in [1,2,3]:await buttons.nth(n).click()
   assert await buttons.nth(4).is_disabled();await dialog.get_by_role('button',name='Send times',exact=True).click();await dialog.wait_for(state="hidden");await rpage.get_by_text('Suggested pickup times',exact=True).wait_for(timeout=15000);row=rest('messages?claim_id=eq.'+claim+'&kind=eq.times')[0]
   assert not live('confirm_time',{'claim_id':claim,'message_id':row['id'],'time':row['slots'][0]},hs[0]).ok
   assert not live('share_spot',{'claim_id':claim,'text':'Library steps'},hs[2]).ok
   await rpage.locator('.msg').filter(has_text='Suggested pickup times').get_by_role('button').first.click();await g.get_by_role('button',name='Mark as picked up',exact=True).wait_for(timeout=15000);assert rest('claims?id=eq.'+claim)[0]['status']=='pickup_arranged'
   async with rpage.expect_download() as dl:await rpage.get_by_role('button',name='Add to calendar',exact=True).click()
   download=await dl.value;await download.save_as('/tmp/browser/part6c/pickup.ics');assert 'LOCATION:' not in open('/tmp/browser/part6c/pickup.ics').read()
   await g.get_by_role('button',name='Share pickup spot',exact=True).click();assert await g.get_by_label('Where should they meet you?',exact=True).input_value()=='';await g.get_by_label('Where should they meet you?',exact=True).fill('Library steps');await g.get_by_role('dialog',name='Share pickup spot').get_by_role('button',name='Share',exact=True).click();await g.get_by_role('dialog',name='Share pickup spot').wait_for(state='hidden');await rpage.get_by_text('Library steps',exact=True).wait_for(timeout=15000);assert not rest('messages?claim_id=eq.'+claim,h=hs[2])
   for page,width,height in [(g,1280,1800),(g,1067,1128),(rpage,390,844)]:
    await page.set_viewport_size({'width':width,'height':height});await page.evaluate('window.scrollTo(0,0)');await page.screenshot(path='/tmp/browser/part6c/chat-'+str(width)+'.png');assert await page.locator('html').evaluate('(e)=>e.scrollWidth<=innerWidth')
   print('three-slot selection, participant-only confirmation, calendar and private explicit spot verified')
   await g.get_by_role('button',name='Chat menu',exact=True).click();await g.get_by_role('link',name='View profile',exact=True).click();await g.wait_for_url('**/member/*');await g.get_by_role('heading',name='Pickup 1.',exact=True).wait_for();await g.goto('http://localhost:8080/messages/'+claim,wait_until='networkidle')
   await g.get_by_role('button',name='Mark as picked up',exact=True).click();await rpage.get_by_role('button',name='Say thanks',exact=True).wait_for(timeout=15000);await rpage.get_by_role('button',name='Say thanks',exact=True).click();await rpage.get_by_role('button',name='Skip',exact=True).click();assert rest('claims?id=eq.'+claim)[0]['status']=='picked_up';await rpage.get_by_role('button',name='Say thanks',exact=True).click();assert not await rpage.get_by_role('checkbox').is_checked();await rpage.get_by_label('Short note (optional)',exact=True).fill('Thank you for passing this along!');await rpage.set_input_files('input[aria-label="Upload photo file"]','/tmp/browser/passalong/photo.jpg');await rpage.get_by_role('checkbox').check();await rpage.get_by_role('button',name='Send thanks',exact=True).click();await rpage.get_by_text('Picked up and thanked — a good thing passed along.',exact=True).wait_for();kw=rest('kind_words?claim_id=eq.'+claim)[0];photos.append(kw['photo_path']);assert kw['show_on_profile'];await g.get_by_text('Thank you for passing this along!',exact=True).wait_for(timeout=15000)
   await g.goto('http://localhost:8080/notifications',wait_until='networkidle');assert await g.get_by_text('Pickup 1. thanked you',exact=True).count()==1
   await g.goto('http://localhost:8080/messages',wait_until='networkidle');await g.get_by_role('button',name='Giving',exact=True).click();await g.get_by_text('Done',exact=True).wait_for();await g.get_by_role('button',name='Receiving',exact=True).click();await g.get_by_text("No chats yet. When you claim something, or someone claims yours, you'll talk here.",exact=True).wait_for()
   names=[e['name'] for e in rest('events?user_id=in.('+','.join(users)+')')];assert all(n in names for n in ['times_suggested','pickup_spot_shared','pickup_arranged','picked_up','thanked']);assert not any('email' in n for n in names);assert not errors,errors
   print('profile menu, pickup, optional photo thanks, explicit consent, filters, safe events and no email verified');await b.close()
 finally:
  for uid in users:
   for table,col in [('events','user_id'),('notifications','user_id'),('kind_words','writer_id'),('chat_reports','reporter_id'),('messages','sender_id'),('claims','receiver_id'),('wishes','user_id'),('item_watchers','user_id'),('swipe_passes','user_id'),('items','giver_id'),('circle_members','user_id'),('user_roles','user_id')]:requests.delete(B+'/rest/v1/'+table+'?'+col+'=eq.'+uid,headers=H)
  for cid in circles:requests.delete(B+'/rest/v1/circles?id=eq.'+cid,headers=H)
  for path in photos:requests.delete(B+'/storage/v1/object/item-photos/'+path,headers=H)
  for uid in users:requests.delete(B+'/auth/v1/admin/users/'+uid,headers=H)
  print('temporary records removed')
asyncio.run(main())
