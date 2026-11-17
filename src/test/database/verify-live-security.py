import os,requests,secrets,json
B=os.environ['SUPABASE_URL'];K=os.environ['SUPABASE_SERVICE_ROLE_KEY'];P=os.environ['VITE_SUPABASE_PUBLISHABLE_KEY'];H={'apikey':K,'Authorization':'Bearer '+K,'Content-Type':'application/json'}
users=[];rows=[];sessions=[]
def call(path,body,h):return requests.post(B+'/rest/v1/rpc/'+path,headers=h,json=body)
try:
 for n in range(3):
  email='passalong-rules-'+secrets.token_hex(6)+'@berkeley.edu';password=secrets.token_urlsafe(24)
  r=requests.post(B+'/auth/v1/admin/users',headers=H,json={'email':email,'password':password,'email_confirm':True});r.raise_for_status();users.append(r.json()['id'])
  r=requests.post(B+'/auth/v1/token?grant_type=password',headers={'apikey':P},json={'email':email,'password':password});r.raise_for_status();sessions.append({'apikey':P,'Authorization':'Bearer '+r.json()['access_token'],'Content-Type':'application/json'})
 c=requests.get(B+'/rest/v1/circles?select=id,invite_token&name=eq.Haas%20FTMBA%202027',headers=H).json()[0]
 for h in sessions[:2]:call('passalong_action',{'action':'join','payload':{'token':c['invite_token']}},h).raise_for_status()
 r=requests.post(B+'/rest/v1/items',headers={**H,'Prefer':'return=representation'},json={'circle_id':c['id'],'giver_id':users[0],'title':'Seedlings','condition':'Good','category':'Garden','pickup_area':'Near campus','photo_path':'verification/no-photo','expires_at':'2026-11-16T00:00:00Z'});r.raise_for_status();item=r.json()[0];rows.append(item['id'])
 # Expired timestamps are already unclaimable before the hourly job runs.
 assert not call('passalong_action',{'action':'claim','payload':{'item_id':item['id']}},sessions[1]).ok
 r=call('process_due',{},H);r.raise_for_status()
 assert requests.get(B+'/rest/v1/items?id=eq.'+item['id'],headers=H).json()[0]['status']=='expired'
 print('expired item rejected at claim time and persisted by job')
 assert requests.get(B+'/rest/v1/items?id=eq.'+item['id'],headers=sessions[2]).json()==[]
 assert not call('passalong_action',{'action':'claim','payload':{'item_id':item['id']}},sessions[2]).ok
 assert not call('circle_action',{'action':'remove_member','payload':{'circle_id':c['id'],'user_id':users[0]}},sessions[2]).ok
 assert not call('admin_metrics',{},sessions[2]).ok
 assert not requests.post(B+'/rest/v1/user_roles',headers=sessions[2],json={'user_id':users[2],'role':'admin'}).ok
 print('outsider inventory, actions, admin metrics and role escalation rejected')
 call('passalong_action',{'action':'renew','payload':{'item_id':item['id']}},sessions[0]).raise_for_status()
 r=call('passalong_action',{'action':'claim','payload':{'item_id':item['id']}},sessions[1]);r.raise_for_status();claim=r.json()['id']
 assert not call('passalong_action',{'action':'claim','payload':{'item_id':item['id']}},sessions[2]).ok
 requests.patch(B+'/rest/v1/claims?id=eq.'+claim,headers=H,json={'pickup_by':'2026-11-16T00:00:00Z'}).raise_for_status()
 assert not call('passalong_action',{'action':'pickup','payload':{'claim_id':claim}},sessions[1]).ok
 call('process_due',{},H).raise_for_status()
 assert requests.get(B+'/rest/v1/claims?id=eq.'+claim,headers=H).json()[0]['status']=='expired'
 assert requests.get(B+'/rest/v1/items?id=eq.'+item['id'],headers=H).json()[0]['status']=='available'
 print('48-hour expired claim cannot complete pickup; job reopens item')
 # Anonymous preview is a narrow projection, not the full row.
 preview=call('item_preview',{'item':item['id']},{'apikey':P}).json()[0]
 assert set(preview)=={'id','title','condition','circle_name','photo_path'}
 print('public preview excludes giver, wishes, descriptions and pickup area')
finally:
 claims=requests.get(B+'/rest/v1/claims?receiver_id=in.('+','.join(users)+')&select=id',headers=H).json()
 ids=[c['id'] for c in claims] if isinstance(claims,list) else []
 for table,col,values in [('messages','claim_id',ids),('chat_reports','claim_id',ids),('notifications','user_id',users),('events','user_id',users),('item_matches','user_id',users),('claims','id',ids),('wishes','user_id',users),('items','id',rows)]:
  if values:requests.delete(B+'/rest/v1/'+table+'?'+col+'=in.('+','.join(values)+')',headers=H)
 for u in users:requests.delete(B+'/auth/v1/admin/users/'+u,headers=H)
 print('verification data removed')
