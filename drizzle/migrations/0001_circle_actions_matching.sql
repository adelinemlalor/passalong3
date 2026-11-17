CREATE FUNCTION public.normal_words(t text) RETURNS text[] LANGUAGE sql IMMUTABLE SET search_path=public AS $$ SELECT coalesce(array_agg(CASE WHEN length(w)>3 AND w LIKE '%s' AND w NOT LIKE '%ss' THEN left(w,length(w)-1) ELSE w END),'{}') FROM regexp_split_to_table(lower(t),'[^a-z0-9]+') w WHERE w<>'' $$;
CREATE FUNCTION public.wish_matches(t text,p text,cat text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.normal_words(t) && public.normal_words(p) OR EXISTS(SELECT 1 FROM public.synonyms s WHERE s.category=cat AND public.normal_words(array_to_string(s.words,' ')) && public.normal_words(t) AND public.normal_words(array_to_string(s.words,' ')) && public.normal_words(p)) $$;
CREATE FUNCTION public.recalculate_matches() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
DELETE FROM public.item_matches m WHERE NOT EXISTS(SELECT 1 FROM public.items i JOIN public.wishes w ON w.id=m.wish_id WHERE i.id=m.item_id AND i.circle_id=w.circle_id AND i.category=w.category AND i.status='available' AND i.expires_at>now() AND public.wish_matches(i.title,w.text,i.category));
WITH fresh AS (INSERT INTO public.item_matches(item_id,wish_id,user_id) SELECT i.id,w.id,w.user_id FROM public.items i JOIN public.wishes w ON w.circle_id=i.circle_id AND w.category=i.category JOIN public.circle_members cm ON cm.circle_id=i.circle_id AND cm.user_id=w.user_id WHERE i.status='available' AND i.expires_at>now() AND i.giver_id<>w.user_id AND public.wish_matches(i.title,w.text,i.category) ON CONFLICT DO NOTHING RETURNING *) INSERT INTO public.events(user_id,item_id,circle_id,name) SELECT f.user_id,f.item_id,i.circle_id,'match_created' FROM fresh f JOIN public.items i ON i.id=f.item_id;
RETURN NULL; END $$;
CREATE TRIGGER items_match AFTER INSERT OR UPDATE OF title,category,status ON public.items FOR EACH STATEMENT EXECUTE FUNCTION public.recalculate_matches();
CREATE TRIGGER wishes_match AFTER INSERT OR DELETE ON public.wishes FOR EACH STATEMENT EXECUTE FUNCTION public.recalculate_matches();
CREATE TRIGGER synonyms_match AFTER INSERT OR UPDATE OR DELETE ON public.synonyms FOR EACH STATEMENT EXECUTE FUNCTION public.recalculate_matches();
CREATE FUNCTION public.process_due() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE r record; local_hour int=extract(hour FROM now() AT TIME ZONE 'America/Los_Angeles'); BEGIN
FOR r IN SELECT c.*,i.circle_id FROM public.claims c JOIN public.items i ON i.id=c.item_id WHERE c.status IN('claimed','pickup_arranged') AND c.pickup_by<=now() FOR UPDATE OF c SKIP LOCKED LOOP
UPDATE public.claims SET status='expired' WHERE id=r.id;
UPDATE public.items SET status='available',expires_at=now()+interval '7 days',reminded=false WHERE id=r.item_id;
INSERT INTO public.events(user_id,item_id,circle_id,name) VALUES(r.receiver_id,r.item_id,r.circle_id,'claim_expired');
INSERT INTO public.notifications(user_id,item_id,kind) SELECT w.user_id,w.item_id,'free_again' FROM public.item_watchers w JOIN public.circle_members cm ON cm.user_id=w.user_id AND cm.circle_id=r.circle_id WHERE w.item_id=r.item_id;
DELETE FROM public.item_watchers WHERE item_id=r.item_id;
END LOOP;
FOR r IN SELECT * FROM public.items WHERE status='available' AND expires_at<=now() FOR UPDATE SKIP LOCKED LOOP
UPDATE public.items SET status='expired' WHERE id=r.id; INSERT INTO public.events(user_id,item_id,circle_id,name) VALUES(r.giver_id,r.id,r.circle_id,'item_expired'); END LOOP;
FOR r IN SELECT * FROM public.items WHERE status='available' AND expires_at>now() AND expires_at<=now()+interval '2 days' AND NOT reminded FOR UPDATE SKIP LOCKED LOOP
UPDATE public.items SET reminded=true WHERE id=r.id; INSERT INTO public.notifications(user_id,item_id,kind) VALUES(r.giver_id,r.id,'renew'); END LOOP;
IF local_hour>=8 AND local_hour<21 THEN
FOR r IN SELECT m.*,i.circle_id FROM public.item_matches m JOIN public.items i ON i.id=m.item_id JOIN public.circle_members cm ON cm.user_id=m.user_id AND cm.circle_id=i.circle_id WHERE m.notified_at IS NULL AND i.status='available' AND i.expires_at>now() FOR UPDATE OF m SKIP LOCKED LOOP
INSERT INTO public.notifications(user_id,item_id,kind) VALUES(r.user_id,r.item_id,'match'); UPDATE public.item_matches SET notified_at=now() WHERE item_id=r.item_id AND wish_id=r.wish_id; INSERT INTO public.events(user_id,item_id,circle_id,name) VALUES(r.user_id,r.item_id,r.circle_id,'match_notification_sent'); END LOOP; END IF;
END $$;
CREATE FUNCTION public.passalong_action(action text, payload jsonb DEFAULT '{}') RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE u uuid=auth.uid(); i public.items; c public.claims; cid uuid; rid uuid; event_name text; BEGIN
IF u IS NULL THEN RAISE EXCEPTION 'Sign in to continue'; END IF;
IF action='join' THEN
SELECT id INTO cid FROM public.circles WHERE invite_token=(payload->>'token')::uuid; IF cid IS NULL THEN RAISE EXCEPTION 'This invite is not valid'; END IF;
INSERT INTO public.events(user_id,circle_id,name) VALUES(u,cid,'circle_link_opened');
INSERT INTO public.circle_members(circle_id,user_id) VALUES(cid,u) ON CONFLICT DO NOTHING; IF FOUND THEN INSERT INTO public.events(user_id,circle_id,name) VALUES(u,cid,'joined_circle'); END IF; RETURN jsonb_build_object('id',cid);
ELSIF action='profile' THEN
UPDATE public.profiles SET display_name=coalesce(nullif(trim(payload->>'display_name'),''),display_name), avatar_url=coalesce(payload->>'avatar_url',avatar_url), onboarded=coalesce((payload->>'onboarded')::boolean,onboarded) WHERE id=u AND length(coalesce(payload->>'display_name',''))<=80; RETURN '{}';
ELSIF action='clearout' THEN
IF NOT payload ? 'choice' THEN RAISE EXCEPTION 'Choose an option'; END IF;
UPDATE public.profiles SET clearout_choice=(payload->>'choice')::boolean WHERE id=u; INSERT INTO public.events(user_id,name) VALUES(u,CASE WHEN (payload->>'choice')::boolean THEN 'clearout_interest_yes' ELSE 'clearout_interest_no' END); RETURN '{}';
ELSIF action='create_circle' THEN
IF NOT public.is_admin() THEN RAISE EXCEPTION 'Admin access required'; END IF;
INSERT INTO public.circles(name) VALUES(trim(payload->>'name')) RETURNING id INTO cid; INSERT INTO public.circle_members(circle_id,user_id) VALUES(cid,u); RETURN jsonb_build_object('id',cid);
ELSIF action='synonym' THEN
IF NOT public.is_admin() THEN RAISE EXCEPTION 'Admin access required'; END IF;
IF payload ? 'id' THEN DELETE FROM public.synonyms WHERE id=(payload->>'id')::uuid; ELSE INSERT INTO public.synonyms(category,words) VALUES(payload->>'category',ARRAY(SELECT jsonb_array_elements_text(payload->'words'))); END IF; RETURN '{}';
END IF;
IF payload ? 'claim_id' THEN
SELECT * INTO c FROM public.claims WHERE id=(payload->>'claim_id')::uuid FOR UPDATE; SELECT * INTO i FROM public.items WHERE id=c.item_id FOR UPDATE;
IF c.id IS NULL OR (u<>c.receiver_id AND u<>i.giver_id) OR NOT public.is_member(i.circle_id) THEN RAISE EXCEPTION 'This conversation is private'; END IF;
cid=i.circle_id;
IF action='message' THEN IF c.status='expired' THEN RAISE EXCEPTION 'This claim has expired'; END IF; INSERT INTO public.messages(claim_id,sender_id,text) VALUES(c.id,u,trim(payload->>'text'));
ELSIF action='report' THEN INSERT INTO public.chat_reports(claim_id,reporter_id,reason) VALUES(c.id,u,trim(payload->>'reason'));
ELSIF action='extend' THEN IF u<>i.giver_id OR c.status NOT IN('claimed','pickup_arranged') OR c.pickup_by<=now() THEN RAISE EXCEPTION 'Only the giver can extend an active claim'; END IF; UPDATE public.claims SET pickup_by=greatest(pickup_by,now())+interval '48 hours' WHERE id=c.id;
ELSIF action='arrange' THEN IF c.status<>'claimed' OR c.pickup_by<=now() THEN RAISE EXCEPTION 'This claim is not active'; END IF; UPDATE public.claims SET status='pickup_arranged' WHERE id=c.id; event_name='pickup_arranged';
ELSIF action='pickup' THEN IF c.status NOT IN('claimed','pickup_arranged') OR c.pickup_by<=now() THEN RAISE EXCEPTION 'This claim is not active'; END IF; UPDATE public.claims SET status='picked_up',picked_up_at=now() WHERE id=c.id; UPDATE public.items SET status='picked_up' WHERE id=i.id; event_name='picked_up';
ELSIF action='thank' THEN IF c.status<>'picked_up' OR u<>c.receiver_id THEN RAISE EXCEPTION 'Only the receiver can thank after pickup'; END IF; UPDATE public.claims SET status='thanked' WHERE id=c.id; UPDATE public.items SET status='thanked' WHERE id=i.id; event_name='thanked';
ELSE RAISE EXCEPTION 'Unknown action'; END IF;
IF event_name IS NOT NULL THEN INSERT INTO public.events(user_id,item_id,circle_id,name) VALUES(u,i.id,cid,event_name); END IF; RETURN jsonb_build_object('id',c.id);
END IF;
IF payload ? 'item_id' THEN SELECT * INTO i FROM public.items WHERE id=(payload->>'item_id')::uuid FOR UPDATE; cid=i.circle_id;
ELSE cid=(payload->>'circle_id')::uuid; END IF;
IF cid IS NULL OR NOT public.is_member(cid) THEN RAISE EXCEPTION 'Join this circle first'; END IF;
IF action='post' THEN
IF NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='item-photos' AND name=payload->>'photo_path' AND (storage.foldername(name))[1]=u::text) THEN RAISE EXCEPTION 'Please upload your photo first'; END IF;
INSERT INTO public.items(circle_id,giver_id,title,description,condition,category,pickup_area,photo_path) VALUES(cid,u,trim(payload->>'title'),coalesce(payload->>'description',''),payload->>'condition',payload->>'category',payload->>'pickup_area',payload->>'photo_path') RETURNING id INTO rid; event_name='item_posted';
ELSIF action='wish' THEN INSERT INTO public.wishes(user_id,circle_id,text,category) VALUES(u,cid,trim(payload->>'text'),payload->>'category') RETURNING id INTO rid; event_name='wish_added';
ELSIF action='delete_wish' THEN DELETE FROM public.wishes WHERE id=(payload->>'wish_id')::uuid AND user_id=u;
ELSIF action='claim' THEN
IF i.giver_id=u THEN RAISE EXCEPTION 'You cannot claim your own item'; END IF;
IF i.status<>'available' OR i.expires_at<=now() THEN RAISE EXCEPTION 'Someone claimed this item, or it expired'; END IF;
INSERT INTO public.claims(item_id,receiver_id) VALUES(i.id,u) RETURNING id INTO rid; UPDATE public.items SET status='claimed' WHERE id=i.id; event_name='item_claimed';
ELSIF action='watch' THEN INSERT INTO public.item_watchers(item_id,user_id) VALUES(i.id,u) ON CONFLICT DO NOTHING; IF FOUND THEN event_name='notify_me_tapped'; END IF;
ELSIF action='pass' THEN INSERT INTO public.swipe_passes(item_id,user_id) VALUES(i.id,u) ON CONFLICT DO NOTHING; IF FOUND THEN event_name='swipe_left'; END IF;
ELSIF action IN('renew','donate','remove','edit_item') THEN
IF i.giver_id<>u THEN RAISE EXCEPTION 'Only the giver can change this item'; END IF;
IF i.status NOT IN('available','expired') THEN RAISE EXCEPTION 'This item has an active or completed claim'; END IF;
IF action='renew' THEN UPDATE public.items SET status='available',expires_at=now()+interval '7 days',reminded=false WHERE id=i.id; event_name='item_renewed';
ELSIF action='donate' THEN UPDATE public.items SET status='donated' WHERE id=i.id; event_name='item_marked_donated';
ELSIF action='remove' THEN UPDATE public.items SET status='removed' WHERE id=i.id;
ELSE UPDATE public.items SET title=trim(payload->>'title'),category=payload->>'category' WHERE id=i.id; END IF;
ELSIF action='read_notifications' THEN UPDATE public.notifications SET read_at=now() WHERE user_id=u;
ELSIF action='event' THEN event_name=payload->>'name'; IF event_name NOT IN('item_link_opened','post_nudge_shown','item_shared','swipe_right') THEN RAISE EXCEPTION 'Invalid client event'; END IF;
ELSE RAISE EXCEPTION 'Unknown action'; END IF;
IF event_name IS NOT NULL THEN INSERT INTO public.events(user_id,item_id,circle_id,name) VALUES(u,CASE WHEN action='post' THEN rid ELSE i.id END,cid,event_name); END IF;
RETURN jsonb_build_object('id',rid); END $$;
CREATE FUNCTION public.admin_metrics() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE result jsonb; BEGIN IF NOT public.is_admin() THEN RAISE EXCEPTION 'Admin access required'; END IF;
SELECT jsonb_build_object('counts',(SELECT coalesce(jsonb_agg(x),'[]') FROM (SELECT date_trunc('week',created_at)::date AS week,name,count(*) AS count FROM public.events GROUP BY 1,2 ORDER BY 1 DESC,2) x),'outcomes',(SELECT coalesce(jsonb_agg(x),'[]') FROM (SELECT date_trunc('week',i.created_at)::date AS week,count(*) AS posted,round(100.0*count(*) FILTER(WHERE first_claim<=i.created_at+interval '3 days')/nullif(count(*),0),1) AS claimed_within_3_days,percentile_cont(0.5) WITHIN GROUP(ORDER BY extract(epoch FROM first_claim-i.created_at)/3600) AS median_hours_to_claim FROM public.items i LEFT JOIN (SELECT item_id,min(created_at) first_claim FROM public.claims GROUP BY item_id) c ON c.item_id=i.id GROUP BY 1 ORDER BY 1 DESC) x),'active',(SELECT coalesce(jsonb_agg(x),'[]') FROM (SELECT date_trunc('week',created_at)::date AS week,count(DISTINCT user_id) AS members FROM public.events GROUP BY 1 ORDER BY 1 DESC) x),'reports',(SELECT coalesce(jsonb_agg(x),'[]') FROM (SELECT id,claim_id,reason,created_at FROM public.chat_reports ORDER BY created_at DESC LIMIT 100) x)) INTO result; RETURN result; END $$;
REVOKE ALL ON FUNCTION public.normal_words(text),public.wish_matches(text,text,text),public.recalculate_matches(),public.process_due() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.process_due() TO service_role;
REVOKE ALL ON FUNCTION public.passalong_action(text,jsonb),public.admin_metrics() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.passalong_action(text,jsonb),public.admin_metrics() TO authenticated;